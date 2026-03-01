import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Family } from '../entities/Family';
import { Driver } from '../entities/Driver';

const familyRepository = AppDataSource.getRepository(Family);
const driverRepository = AppDataSource.getRepository(Driver);

export const createFamily = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: 'Family name is required' });
        }

        // Check if user is already in a family? 
        // For now, allow creating a new one which switches them.

        // Generate simple code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const family = familyRepository.create({
            nombre,
            codigo: code
        });

        const savedFamily = await familyRepository.save(family);

        // Assign user to this family
        const driver = await driverRepository.findOneBy({ id: userId });
        if (driver) {
            driver.family = savedFamily;
            await driverRepository.save(driver);
        }

        res.status(201).json(savedFamily);
    } catch (error) {
        res.status(500).json({ message: 'Error creating family', error });
    }
};

export const joinFamily = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { codigo } = req.body;

        if (!codigo) {
            return res.status(400).json({ message: 'Family code is required' });
        }

        const family = await familyRepository.findOneBy({ codigo });
        if (!family) {
            return res.status(404).json({ message: 'Family not found' });
        }

        const driver = await driverRepository.findOneBy({ id: userId });
        if (!driver) {
            return res.status(404).json({ message: 'User not found' });
        }

        driver.family = family;
        await driverRepository.save(driver);

        res.json({ message: 'Joined family successfully', family });
    } catch (error) {
        res.status(500).json({ message: 'Error joining family', error });
    }
};

export const getMyFamily = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const driver = await driverRepository.findOne({
            where: { id: userId },
            relations: ['family', 'family.drivers', 'family.vehicles']
        });

        if (!driver || !driver.family) {
            return res.status(404).json({ message: 'Not in a family' });
        }

        const family = driver.family;
        const plainFamily = {
            ...family,
            drivers: family.drivers ? family.drivers.map(d => {
                const { family, ...rest } = d;
                return rest;
            }) : [],
            vehicles: family.vehicles ? family.vehicles.map(v => {
                const { family, ...rest } = v;
                return rest;
            }) : []
        };

        res.json(plainFamily);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching family', error });
    }
};

// Admin Endpoints
export const getAllFamilies = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { role } = req.user;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const families = await familyRepository.find({
            relations: ['drivers', 'vehicles'],
            order: { nombre: 'ASC' }
        });
        const plainFamilies = families.map(f => ({
            ...f,
            drivers: f.drivers ? f.drivers.map(d => {
                const { family, ...rest } = d;
                return rest;
            }) : [],
            vehicles: f.vehicles ? f.vehicles.map(v => {
                const { family, ...rest } = v;
                return rest;
            }) : []
        }));
        res.json(plainFamilies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching families', error });
    }
};

export const createFamilyAdmin = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { role } = req.user;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { nombre } = req.body;
        if (!nombre) return res.status(400).json({ message: 'Name is required' });

        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const family = familyRepository.create({ nombre, codigo: code });
        const savedFamily = await familyRepository.save(family);

        res.status(201).json(savedFamily);
    } catch (error) {
        res.status(500).json({ message: 'Error creating family', error });
    }
};

export const deleteFamily = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { role } = req.user;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const family = await familyRepository.findOne({
            where: { id: parseInt(id) },
            relations: ['drivers', 'vehicles']
        });

        if (!family) return res.status(404).json({ message: 'Family not found' });

        // Unlink drivers and vehicles manually if strict (optional if cascade set in DB)
        // TypeORM logic: If nullable=true, setting to null works.
        // But let's let TypeORM handle it or just delete.
        // Given relations in entities, we might need to be careful.
        // Let's assume on delete set null is configured or we do it.

        await familyRepository.remove(family);
        res.json({ message: 'Family deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting family', error });
    }
};
