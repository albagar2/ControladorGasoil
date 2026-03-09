import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';
import { Vehicle } from '../entities/Vehicle';
import { asyncHandler } from '../utils/asyncHandler';
import { alertService } from '../services/alert.service';

const vehicleRepository = AppDataSource.getRepository(Vehicle);
const driverRepository = AppDataSource.getRepository(Driver);

const sanitizeVehicleData = (data: any) => {
    const sanitized = { ...data };
    for (const key in sanitized) {
        // Convert empty strings to null for database compatibility
        if (sanitized[key] === '') {
            sanitized[key] = null;
        }
    }
    return sanitized;
};

export const getVehicles = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { userId, role, familyId } = req.user;

    if (role === 'admin') {
        const vehicles = await vehicleRepository.find({ relations: ["propietario", "family"] });
        return res.json(vehicles);
    }

    if (!familyId) {
        // Fallback: If no family, see only owned vehicles
        const vehicles = await vehicleRepository.find({
            where: { propietarioId: userId },
            relations: ["propietario"]
        });
        return res.json(vehicles);
    }

    const vehicles = await vehicleRepository.find({
        where: { familyId: familyId },
        relations: ["propietario", "family"]
    });
    res.json(vehicles);
});

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { userId } = req.user;
    const driver = await driverRepository.findOneBy({ id: userId });

    // Sanitize data: convert empty strings to null
    const vehicleData: any = sanitizeVehicleData(req.body);

    // Check if matricula already exists
    if (vehicleData.matricula) {
        const existing = await vehicleRepository.findOneBy({ matricula: vehicleData.matricula.toUpperCase().trim() });
        if (existing) {
            return res.status(400).json({ status: 'error', message: `La matrícula ${vehicleData.matricula} ya está registrada.` });
        }
    }

    if (driver && driver.familyId) {
        vehicleData.familyId = driver.familyId;
    }
    vehicleData.propietarioId = vehicleData.propietarioId || userId;

    const newVehicle = vehicleRepository.create(vehicleData as Vehicle);
    const savedVehicle = await vehicleRepository.save(newVehicle);

    // Check for alerts immediately (e.g. if ITV/Insurance dates are already close)
    try {
        await alertService.checkAndSendAlerts(savedVehicle.id);
    } catch (error) {
        console.error(`[AlertService] Failed to send alerts for vehicle ${savedVehicle.id}:`, error);
    }

    res.status(201).json(savedVehicle);
});

export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ["propietario"]
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId, userId } = req.user;
    const vehicle = await vehicleRepository.findOneBy({ id: parseInt(req.params.id) });

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Security Check: Admin or same family or owner
    if (role !== 'admin' && vehicle.familyId !== familyId && vehicle.propietarioId !== userId) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this vehicle' });
    }

    const sanitizedData = sanitizeVehicleData(req.body);
    vehicleRepository.merge(vehicle, sanitizedData);
    const results = await vehicleRepository.save(vehicle);

    // Check for alerts immediately
    try {
        await alertService.checkAndSendAlerts(vehicle.id);
    } catch (error) {
        console.error(`[AlertService] Failed to send alerts for vehicle ${vehicle.id}:`, error);
    }

    res.json(results);
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId, userId } = req.user;
    const vehicle = await vehicleRepository.findOneBy({ id: parseInt(req.params.id) });

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Security Check
    if (role !== 'admin' && vehicle.familyId !== familyId && vehicle.propietarioId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    await vehicleRepository.remove(vehicle);
    res.json({ message: 'Vehicle deleted successfully' });
});
