import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';
const driverRepository = AppDataSource.getRepository(Driver);

export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers['authorization'];

    if (!header) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.id || decoded.userId;

        // Fetch user to get current familyId and role from DB (more secure than token)
        const user = await driverRepository.findOneBy({ id: userId });

        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        (req as any).user = {
            userId: user.id,
            role: user.role,
            familyId: user.familyId
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
