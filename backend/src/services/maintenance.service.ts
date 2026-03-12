import { AppDataSource } from '../data-source';
import { Maintenance } from '../entities/Maintenance';
import { Vehicle } from '../entities/Vehicle';
import { DriveService } from './drive.service';
import { alertService } from './alert.service';
import fs from 'fs';

export class MaintenanceService {
    private static maintenanceRepository = AppDataSource.getRepository(Maintenance);
    private static vehicleRepository = AppDataSource.getRepository(Vehicle);

    static async getAll(role: string, familyId?: number) {
        const query = this.maintenanceRepository.createQueryBuilder("maintenance")
            .leftJoinAndSelect("maintenance.vehiculo", "vehicle")
            .leftJoinAndSelect("maintenance.conductor", "driver")
            .orderBy("maintenance.fecha", "DESC");

        if (role !== 'admin') {
            if (!familyId) return [];
            query.where("vehicle.familyId = :familyId", { familyId });
        }

        return await query.getMany();
    }

    static async create(data: any, file?: any, user?: any) {
        const { role, familyId } = user;
        const sanitized = this.sanitize(data);

        const vehicle = await this.vehicleRepository.findOneBy({ id: sanitized.vehiculoId });
        if (!vehicle) {
            if (file) fs.unlinkSync(file.path);
            throw new Error("Vehicle not found");
        }

        // Security Check
        if (role !== 'admin' && vehicle.familyId !== familyId) {
            if (file) fs.unlinkSync(file.path);
            throw new Error("Forbidden: Vehicle belongs to another family");
        }

        let ticketImageUrl = undefined;
        if (file) {
            ticketImageUrl = await DriveService.uploadTicket(file.path, vehicle, 'MNT') || `uploads/${file.filename}`;
        }

        const maintenanceEntity = this.maintenanceRepository.create(sanitized as any) as any;
        if (ticketImageUrl) maintenanceEntity.ticketImageUrl = ticketImageUrl;

        const maintenance = await this.maintenanceRepository.save(maintenanceEntity) as any as Maintenance;

        // Update mileage
        if (sanitized.kilometraje > vehicle.kilometrajeActual) {
            vehicle.kilometrajeActual = sanitized.kilometraje;
            await this.vehicleRepository.save(vehicle as any);
        }

        // Alerts
        alertService.checkAndSendAlerts(sanitized.vehiculoId).catch(console.error);

        return await this.maintenanceRepository.findOne({
            where: { id: maintenance.id },
            relations: ["vehiculo", "conductor"]
        }) as any;
    }

    static async update(id: number, data: any, file?: any, user?: any) {
        const { role, familyId } = user;
        let maintenance = await this.maintenanceRepository.findOne({
            where: { id },
            relations: ["vehiculo"]
        });

        if (!maintenance) {
            if (file) fs.unlinkSync(file.path);
            throw new Error("Maintenance not found");
        }

        // Security Check
        if (role !== 'admin' && maintenance.vehiculo.familyId !== familyId) {
            if (file) fs.unlinkSync(file.path);
            throw new Error("Forbidden");
        }

        const sanitized = this.sanitize(data);

        // If changing vehicle, check new vehicle too
        if (sanitized.vehiculoId && sanitized.vehiculoId !== maintenance.vehiculoId) {
            const newVehicle = await this.vehicleRepository.findOneBy({ id: sanitized.vehiculoId });
            if (!newVehicle || (role !== 'admin' && newVehicle.familyId !== familyId)) {
                if (file) fs.unlinkSync(file.path);
                throw new Error("Forbidden: Target vehicle is inaccessible");
            }
        }

        if (file) {
            const vehicle = await this.vehicleRepository.findOneBy({ id: sanitized.vehiculoId || maintenance.vehiculoId });
            sanitized.ticketImageUrl = await DriveService.uploadTicket(file.path, vehicle, 'MNT_UPD') || `uploads/${file.filename}`;
        }

        this.maintenanceRepository.merge(maintenance, sanitized as any);
        await this.maintenanceRepository.save(maintenance);

        // Update mileage
        const vehicle = await this.vehicleRepository.findOneBy({ id: maintenance.vehiculoId });
        if (vehicle && maintenance.kilometraje > vehicle.kilometrajeActual) {
            vehicle.kilometrajeActual = maintenance.kilometraje;
            await this.vehicleRepository.save(vehicle);
        }

        // Alerts
        alertService.checkAndSendAlerts(maintenance.vehiculoId).catch(console.error);

        return await this.maintenanceRepository.findOne({
            where: { id: maintenance.id },
            relations: ["vehiculo", "conductor"]
        });
    }

    static async delete(id: number, user?: any) {
        const { role, familyId } = user;
        const maintenance = await this.maintenanceRepository.findOne({
            where: { id },
            relations: ["vehiculo"]
        });

        if (!maintenance) throw new Error("Maintenance not found");

        if (role !== 'admin' && maintenance.vehiculo.familyId !== familyId) {
            throw new Error("Forbidden");
        }

        await this.maintenanceRepository.remove(maintenance);
        return true;
    }

    private static sanitize(data: any) {
        const sanitized = { ...data };
        if (sanitized.vehiculoId) sanitized.vehiculoId = parseInt(sanitized.vehiculoId.toString());
        if (sanitized.kilometraje) sanitized.kilometraje = parseInt(sanitized.kilometraje.toString());
        if (sanitized.costePieza) sanitized.costePieza = parseFloat(sanitized.costePieza.toString());
        if (sanitized.costeTaller) sanitized.costeTaller = parseFloat(sanitized.costeTaller.toString());

        if (sanitized.conductorId) {
            const cId = parseInt(sanitized.conductorId.toString());
            sanitized.conductorId = cId !== 0 ? cId : null;
        }

        if (sanitized.fecha) sanitized.fecha = new Date(sanitized.fecha);

        return sanitized;
    }
}
