import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
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
        // Attach user specific info to request
        // We use 'userId' because that's what we used in the controller (req.user.userId)
        // But the token payload has { id, role }
        // Debug decoding
        console.log('Decoded Token:', decoded);

        (req as any).user = {
            userId: decoded.id || decoded.userId, // Fallback just in case
            role: decoded.role
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
