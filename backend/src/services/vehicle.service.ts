import { AppDataSource } from '../data-source';
import { Vehicle } from '../entities/Vehicle';
import { Driver } from '../entities/Driver';
import { alertService } from './alert.service';

export class VehicleService {
    private static vehicleRepository = AppDataSource.getRepository(Vehicle);
    private static driverRepository = AppDataSource.getRepository(Driver);

    static async getAll(user: any) {
        const { userId, role, familyId } = user;

        if (role === 'admin') {
            return await this.vehicleRepository.find({ relations: ["propietario", "family"] });
        }

        if (!familyId) {
            return await this.vehicleRepository.find({
                where: { propietarioId: userId },
                relations: ["propietario"]
            });
        }

        return await this.vehicleRepository.find({
            where: { familyId: familyId },
            relations: ["propietario", "family"]
        });
    }

    static async getById(id: number) {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id },
            relations: ["propietario"]
        });
        if (!vehicle) throw new Error("Vehicle not found");
        return vehicle;
    }

    static async create(data: any, user: any) {
        const { userId } = user;
        const driver = await this.driverRepository.findOneBy({ id: userId });
        const sanitizedData = this.sanitize(data);

        if (sanitizedData.matricula) {
            const existing = await this.vehicleRepository.findOneBy({
                matricula: sanitizedData.matricula.toUpperCase().trim()
            });
            if (existing) {
                throw new Error(`La matrícula ${sanitizedData.matricula} ya está registrada.`);
            }
        }

        if (driver && driver.familyId) {
            sanitizedData.familyId = driver.familyId;
        }
        sanitizedData.propietarioId = sanitizedData.propietarioId || userId;

        const newVehicle = this.vehicleRepository.create(sanitizedData as any);
        const savedVehicle = await this.vehicleRepository.save(newVehicle) as any as Vehicle;

        alertService.checkAndSendAlerts(savedVehicle.id).catch(console.error);

        return savedVehicle;
    }

    static async update(id: number, data: any, user: any) {
        const { role, familyId, userId } = user;
        const vehicle = await this.vehicleRepository.findOneBy({ id });

        if (!vehicle) throw new Error("Vehicle not found");

        if (role !== 'admin' && vehicle.familyId !== familyId && vehicle.propietarioId !== userId) {
            throw new Error("Forbidden: Access denied");
        }

        const sanitizedData = this.sanitize(data);
        this.vehicleRepository.merge(vehicle, sanitizedData);
        const savedVehicle = await this.vehicleRepository.save(vehicle) as any as Vehicle;

        alertService.checkAndSendAlerts(savedVehicle.id).catch(console.error);

        return savedVehicle;
    }

    static async delete(id: number, user: any) {
        const { role, familyId, userId } = user;
        const vehicle = await this.vehicleRepository.findOneBy({ id });

        if (!vehicle) throw new Error("Vehicle not found");

        if (role !== 'admin' && vehicle.familyId !== familyId && vehicle.propietarioId !== userId) {
            throw new Error("Forbidden");
        }

        await this.vehicleRepository.remove(vehicle);
        return true;
    }

    private static sanitize(data: any) {
        const sanitized = { ...data };
        delete sanitized.propietario;
        delete sanitized.family;

        if (sanitized.propietarioId) sanitized.propietarioId = parseInt(sanitized.propietarioId.toString());
        if (sanitized.kilometrajeActual) sanitized.kilometrajeActual = parseInt(sanitized.kilometrajeActual.toString());

        if (sanitized.itv_fecha_caducidad) sanitized.itv_fecha_caducidad = new Date(sanitized.itv_fecha_caducidad);
        if (sanitized.seguro_fecha_vencimiento) sanitized.seguro_fecha_vencimiento = new Date(sanitized.seguro_fecha_vencimiento);
        if (sanitized.seguro_precio) sanitized.seguro_precio = parseFloat(sanitized.seguro_precio.toString());

        return sanitized;
    }
}
