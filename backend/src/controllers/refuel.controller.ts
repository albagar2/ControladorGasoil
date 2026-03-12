import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { RefuelService } from '../services/refuel.service';

export const getRefuels = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId } = req.user;
    const refuels = await RefuelService.getAll(role, familyId);
    res.json(refuels);
});

export const createRefuel = asyncHandler(async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const savedRefuel = await RefuelService.create(req.body, req.file, req.user);
        res.status(201).json(savedRefuel);
    } catch (error: any) {
        res.status(error.message === 'Forbidden' ? 403 : 400).json({ message: error.message });
    }
});

export const updateRefuel = asyncHandler(async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const updatedRefuel = await RefuelService.update(id, req.body, req.file, req.user);
        res.json(updatedRefuel);
    } catch (error: any) {
        res.status(error.message === 'Forbidden' ? 403 : 400).json({ message: error.message });
    }
});

export const deleteRefuel = asyncHandler(async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        await RefuelService.delete(id, req.user);
        res.json({ message: 'Refuel deleted successfully' });
    } catch (error: any) {
        res.status(error.message === 'Forbidden' ? 403 : 404).json({ message: error.message });
    }
});
