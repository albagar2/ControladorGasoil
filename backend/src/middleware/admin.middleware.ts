import { Request, Response, NextFunction } from 'express';

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin role required' });
    }

    next();
};
