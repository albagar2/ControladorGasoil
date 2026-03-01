import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error('AsyncHandler caught error:', error);
            const status = error.status || 500;
            const message = error.message || 'Internal Server Error';
            res.status(status).json({ message, error: error.toString() });
        });
    };
