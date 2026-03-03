import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
}

export const errorMiddleware = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[Error] ${statusCode} - ${message}`);
    if (err.stack) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        // Solo enviar stack en desarrollo si se desea, por ahora lo omitimos para seguridad
    });
};

export class CustomError extends Error implements AppError {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'CustomError';
    }
}
