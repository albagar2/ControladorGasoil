import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { VehicleService } from '../services/vehicle.service';

export const getVehicles = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const vehicles = await VehicleService.getAll(req.user);
    res.json(vehicles);
});

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const savedVehicle = await VehicleService.create(req.body, req.user);
        res.status(201).json(savedVehicle);
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const vehicle = await VehicleService.getById(parseInt(req.params.id));
        res.json(vehicle);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const results = await VehicleService.update(parseInt(req.params.id), req.body, req.user);
        res.json(results);
    } catch (error: any) {
        res.status(error.message.includes('Forbidden') ? 403 : 404).json({ message: error.message });
    }
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        await VehicleService.delete(parseInt(req.params.id), req.user);
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (error: any) {
        res.status(error.message === 'Forbidden' ? 403 : 404).json({ message: error.message });
    }
});
