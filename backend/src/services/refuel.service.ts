import { AppDataSource } from '../data-source';
import { Refuel } from '../entities/Refuel';
import { Vehicle } from '../entities/Vehicle';
import { Maintenance } from '../entities/Maintenance';
import { DriveService } from './drive.service';
import { alertService } from './alert.service';
import fs from 'fs';

export class RefuelService {
    private static refuelRepository = AppDataSource.getRepository(Refuel);
    private static vehicleRepository = AppDataSource.getRepository(Vehicle);
    private static maintenanceRepository = AppDataSource.getRepository(Maintenance);

    static async getAll(role: string, familyId?: number) {
        const query = this.refuelRepository.createQueryBuilder("refuel")
            .leftJoinAndSelect("refuel.vehiculo", "vehicle")
            .leftJoinAndSelect("refuel.conductor", "driver")
            .orderBy("refuel.fecha", "DESC");

        if (role !== 'admin') {
            if (!familyId) return [];
            query.where("vehicle.familyId = :familyId", { familyId });
        }

        return await query.getMany();
    }

    static async create(data: any, file?: any, user?: any) {
        const { role, familyId } = user;
        const sanitizedData = this.sanitize(data);

        const vehicle = await this.vehicleRepository.findOneBy({ id: sanitizedData.vehiculoId });
        if (!vehicle) {
            if (file) fs.unlinkSync(file.path);
            throw new Error("Vehicle not found");
        }

        // Security Check
        if (role !== 'admin' && vehicle.familyId !== familyId) {
            if (file) fs.unlinkSync(file.path);
            throw new Error("Forbidden: Vehicle belongs to another family");
        }

        // Handle File Upload
        let ticketImageUrl = sanitizedData.ticketImageUrl;
        if (file) {
            const publicUrl = await DriveService.uploadTicket(file.path, vehicle);
            ticketImageUrl = publicUrl || `uploads/${file.filename}`;
        }

        const newRefuel = this.refuelRepository.create(sanitizedData as any) as any;
        const savedRefuel = await this.refuelRepository.save(newRefuel) as any as Refuel;

        // Update Mileage
        if (savedRefuel.kilometraje > vehicle.kilometrajeActual) {
            vehicle.kilometrajeActual = savedRefuel.kilometraje;
            await this.vehicleRepository.save(vehicle as any);
        }

        // Alerts (Non-blocking)
        alertService.checkAndSendAlerts(savedRefuel.vehiculoId).catch(console.error);

        return savedRefuel;
    }

    static async update(id: number, data: any, file?: any, user?: any) {
        const { role, familyId } = user;
        const refuel = await this.refuelRepository.findOne({
            where: { id },
            relations: ["vehiculo"]
        });

        if (!refuel) {
            if (file) fs.unlinkSync(file.path);
            throw new Error("Refuel not found");
        }

        // Security Check
        if (role !== 'admin' && refuel.vehiculo.familyId !== familyId) {
            if (file) fs.unlinkSync(file.path);
            throw new Error("Forbidden");
        }

        const sanitizedData = this.sanitize(data);

        // Handle File Upload
        if (file) {
            const publicUrl = await DriveService.uploadTicket(file.path, refuel.vehiculo);
            sanitizedData.ticketImageUrl = publicUrl || `uploads/${file.filename}`;
        }

        this.refuelRepository.merge(refuel, sanitizedData);
        const savedRefuel = await this.refuelRepository.save(refuel);
        if (Array.isArray(savedRefuel)) throw new Error("Unexpected array return from save");

        // Update Vehicle Mileage
        const activeVehicle = await this.vehicleRepository.findOneBy({ id: savedRefuel.vehiculoId });
        if (activeVehicle && savedRefuel.kilometraje > activeVehicle.kilometrajeActual) {
            activeVehicle.kilometrajeActual = savedRefuel.kilometraje;
            await this.vehicleRepository.save(activeVehicle);
        }

        // Alerts
        alertService.checkAndSendAlerts(savedRefuel.vehiculoId).catch(console.error);

        return await this.refuelRepository.findOne({
            where: { id: savedRefuel.id },
            relations: ["vehiculo", "conductor"]
        });
    }

    static async delete(id: number, user?: any) {
        const { role, familyId } = user;
        const refuel = await this.refuelRepository.findOne({
            where: { id },
            relations: ["vehiculo"]
        });

        if (!refuel) throw new Error("Refuel not found");

        if (role !== 'admin' && refuel.vehiculo.familyId !== familyId) {
            throw new Error("Forbidden");
        }

        await this.refuelRepository.remove(refuel);
        return true;
    }

    private static sanitize(data: any) {
        const sanitized = { ...data };
        if (sanitized.vehiculoId) sanitized.vehiculoId = parseInt(sanitized.vehiculoId.toString());
        if (sanitized.kilometraje) sanitized.kilometraje = parseInt(sanitized.kilometraje.toString());
        if (sanitized.litros) sanitized.litros = parseFloat(sanitized.litros.toString());
        if (sanitized.precioPorLitro) sanitized.precioPorLitro = parseFloat(sanitized.precioPorLitro.toString());
        if (sanitized.costeTotal) sanitized.costeTotal = parseFloat(sanitized.costeTotal.toString());

        if (sanitized.conductorId) {
            const cId = parseInt(sanitized.conductorId.toString());
            sanitized.conductorId = cId !== 0 ? cId : null;
        }

        if (typeof sanitized.fecha === 'string' && sanitized.fecha.trim() !== '') {
            sanitized.fecha = new Date(sanitized.fecha);
        } else if (!sanitized.fecha) {
            sanitized.fecha = new Date();
        }

        return sanitized;
    }
}
