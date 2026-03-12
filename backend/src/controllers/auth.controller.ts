import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.register(req.body);
        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        return res.json(result);
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(401).json({ message: error.message });
    }
};
