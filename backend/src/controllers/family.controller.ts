import { Request, Response } from 'express';
import { FamilyService } from '../services/family.service';

export const createFamily = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const savedFamily = await FamilyService.create(req.body.nombre, req.user.userId);
        res.status(201).json(savedFamily);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const joinFamily = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const family = await FamilyService.join(req.body.codigo, req.user.userId);
        res.json({ message: 'Joined family successfully', family });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyFamily = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const family = await FamilyService.getMyFamily(req.user.userId);
        res.json(family);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching family', error: error.message });
    }
};

export const getAllFamilies = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        const families = await FamilyService.getAllAdmin();
        res.json(families);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching families', error: error.message });
    }
};

export const createFamilyAdmin = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        const savedFamily = await FamilyService.createAdmin(req.body.nombre);
        res.status(201).json(savedFamily);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteFamily = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        await FamilyService.delete(parseInt(req.params.id));
        res.json({ message: 'Family deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
