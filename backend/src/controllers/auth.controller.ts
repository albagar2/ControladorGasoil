import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
    try {
        console.log('[AuthController] Registration attempt:', { 
            email: req.body.email, 
            role: req.body.role,
            hasFamilyNombre: !!req.body.familyNombre,
            hasFamilyCodigo: !!req.body.familyCodigo
        });
        const result = await AuthService.register(req.body);
        return res.status(201).json(result);
    } catch (error: any) {
        console.error('[AuthController] Registration error:', error.message || error);
        return res.status(400).json({ 
            message: error.message || 'Error desconocido durante el registro',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        console.log('[AuthController] Login attempt for:', req.body.email);
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        return res.json(result);
    } catch (error: any) {
        console.error('[AuthController] Login error:', error.message || error);
        return res.status(401).json({ message: error.message || 'Credenciales inválidas' });
    }
};
