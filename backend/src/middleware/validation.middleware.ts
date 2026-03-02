import { Request, Response, NextFunction } from 'express';

export const validateFields = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const missing = fields.filter(field => !req.body[field]);
        if (missing.length > 0) {
            return res.status(400).json({
                message: `Faltan campos requeridos: ${missing.join(', ')}`
            });
        }
        next();
    };
};
