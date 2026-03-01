import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';
import { asyncHandler } from '../utils/asyncHandler';

const driverRepository = AppDataSource.getRepository(Driver);

export const getDrivers = asyncHandler(async (req: Request, res: Response) => {
    const drivers = await driverRepository.find({
        relations: ['family']
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
    const driver = await driverRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    driverRepository.merge(driver, req.body);
    const result = await driverRepository.save(driver);
    res.json(result);
});


export const deleteDriver = asyncHandler(async (req: Request, res: Response) => {
    const result = await driverRepository.delete(req.params.id);
    if (result.affected === 0) return res.status(404).json({ message: 'Driver not found' });
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

    driverRepository.merge(driver, updateData);
    const result = await driverRepository.save(driver);

    // Remove password from response
    const { password: _, ...driverData } = result;

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
