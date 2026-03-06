import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';
import { asyncHandler } from '../utils/asyncHandler';

const driverRepository = AppDataSource.getRepository(Driver);

export const getDrivers = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId } = req.user;

    if (role === 'admin') {
        const drivers = await driverRepository.find({
            relations: ['family', 'licenses']
        });

        // Apply migration logic to all drivers in the list (for admin view consistency)
        const { migrateLegacyLicense } = require('../utils/migration.utils');
        const migratedDrivers = await Promise.all(drivers.map(d => migrateLegacyLicense(d)));

        return res.json(migratedDrivers);
    }

    if (!familyId) {
        // If no family, return empty or just self (let's do empty for "list" context as per requirement "view conductors of their family")
        return res.json([]);
    }

    const drivers = await driverRepository.find({
        where: { familyId: familyId },
        relations: ['family', 'licenses']
    });
    res.json(drivers);
});

export const createDriver = asyncHandler(async (req: Request, res: Response) => {
    const newDriver = driverRepository.create(req.body);
    const savedDriver = await driverRepository.save(newDriver);
    res.status(201).json(savedDriver);
});

export const getDriverById = asyncHandler(async (req: Request, res: Response) => {
    const driver = await driverRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
});

export const updateDriver = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId, userId } = req.user;
    const driver = await driverRepository.findOneBy({ id: parseInt(req.params.id) });

    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    // Security Check: Admin or SAME USER (for points/profile) or LEADER in same family
    const isSelf = driver.id === userId;
    const sameFamily = driver.familyId === familyId;
    const isLeader = role === 'leader';

    if (role !== 'admin' && !isSelf && !(isLeader && sameFamily)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    driverRepository.merge(driver, req.body);
    const result = await driverRepository.save(driver);
    res.json(result);
});


export const deleteDriver = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId } = req.user;
    const driver = await driverRepository.findOneBy({ id: parseInt(req.params.id) });

    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    // Security: Only admins can delete drivers from list (non-profile delete)? 
    // Usually leaders might delete members.
    if (role !== 'admin' && !(role === 'leader' && driver.familyId === familyId)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    await driverRepository.remove(driver);
    res.json({ message: 'Driver deleted successfully' });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const tokenUserId = req.user.userId;
    const userId = parseInt(String(tokenUserId), 10);

    console.log('UpdateProfile - UserID from token (raw):', tokenUserId);
    console.log('UpdateProfile - UserID parsed:', userId);

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID in token' });
    }

    const driver = await driverRepository.findOneBy({ id: userId });
    console.log('UpdateProfile - Driver found:', driver ? 'Yes' : 'No');

    if (!driver) return res.status(404).json({ message: 'User not found' });

    const { password, ...updateData } = req.body;

    if (password) {
        const bcrypt = require('bcryptjs');
        driver.password = await bcrypt.hash(password, 10);
    }

    // Explicitly handle licenses if provided
    if (req.body.licenses) {
        const { License } = require('../entities/License');
        driver.licenses = req.body.licenses.map((l: any) => {
            const license = new License();
            Object.assign(license, l);
            license.driver = driver;
            return license;
        });
    }

    driverRepository.merge(driver, updateData);
    const result = await driverRepository.save(driver);

    // Reload with relations to return full object
    const updatedDriver = await driverRepository.findOne({
        where: { id: userId },
        relations: ['licenses']
    });

    // Remove password from response
    if (!updatedDriver) return res.status(500).json({ message: 'Error reloading driver' });
    const { password: _, ...driverData } = updatedDriver;

    res.json(driverData);
});

export const deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.userId;
    console.log('DeleteProfile - UserID:', userId);
    const result = await driverRepository.delete(userId);

    if (result.affected === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile deleted successfully' });
});
