import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { MaintenanceService } from '../services/maintenance.service';

export const getMaintenances = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId } = req.user;
    const maintenances = await MaintenanceService.getAll(role, familyId);
    res.json(maintenances);
});

export const createMaintenance = asyncHandler(async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const savedMnt = await MaintenanceService.create(req.body, req.file, req.user);
        res.status(201).json(savedMnt);
    } catch (error: any) {
        res.status(error.message === 'Forbidden' ? 403 : 400).json({ message: error.message });
    }
});

export const updateMaintenance = asyncHandler(async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const updatedMnt = await MaintenanceService.update(id, req.body, req.file, req.user);
        res.json(updatedMnt);
    } catch (error: any) {
        res.status(error.message === 'Forbidden' ? 403 : 400).json({ message: error.message });
    }
});

export const deleteMaintenance = asyncHandler(async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        await MaintenanceService.delete(id, req.user);
        res.status(204).send();
    } catch (error: any) {
        res.status(error.message === 'Forbidden' ? 403 : 404).json({ message: error.message });
    }
});
