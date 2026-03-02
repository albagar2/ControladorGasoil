import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';
import { Vehicle } from '../entities/Vehicle';
import { asyncHandler } from '../utils/asyncHandler';
import { alertService } from '../services/alert.service';

const vehicleRepository = AppDataSource.getRepository(Vehicle);
const driverRepository = AppDataSource.getRepository(Driver);

export const getVehicles = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { userId, role } = req.user;

    if (role === 'admin') {
        const vehicles = await vehicleRepository.find({ relations: ["propietario", "family"] });
        return res.json(vehicles);
    }

    const driver = await driverRepository.findOneBy({ id: userId });

    if (!driver || !driver.familyId) {
        const vehicles = await vehicleRepository.find({
            where: { propietarioId: userId },
            relations: ["propietario"]
        });
        return res.json(vehicles);
    }

    const vehicles = await vehicleRepository.find({
        where: { familyId: driver.familyId },
        relations: ["propietario", "family"]
    });
    res.json(vehicles);
});

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { userId } = req.user;
    const driver = await driverRepository.findOneBy({ id: userId });

    const vehicleData = req.body;
    if (driver && driver.familyId) {
        vehicleData.familyId = driver.familyId;
    }
    vehicleData.propietarioId = userId;

    const newVehicle = vehicleRepository.create(vehicleData);
    const savedVehicle = await vehicleRepository.save(newVehicle);

    // Check for alerts immediately (e.g. if ITV/Insurance dates are already close)
    await alertService.checkAndSendAlerts(savedVehicle.id);

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
    const vehicle = await vehicleRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    vehicleRepository.merge(vehicle, req.body);
    const results = await vehicleRepository.save(vehicle);

    // Check for alerts immediately
    await alertService.checkAndSendAlerts(vehicle.id);

    res.json(results);
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
    const result = await vehicleRepository.delete(req.params.id);
    if (result.affected === 0) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
});
