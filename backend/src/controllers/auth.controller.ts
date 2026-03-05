import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const driverRepository = AppDataSource.getRepository(Driver);
const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

export const register = async (req: Request, res: Response) => {
    try {
        const { nombre, dni, telefono, fechaRenovacionCarnet, email, password, role, licenses } = req.body;

        const existingDriver = await driverRepository.findOne({ where: [{ dni }, { email }] });
        if (existingDriver) {
            return res.status(400).json({ message: 'Driver or Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const driver = driverRepository.create({
            nombre,
            dni,
            telefono,
            fechaRenovacionCarnet,
            email,
            password: hashedPassword,
            role,
            puntos: req.body.puntos || 15,
            puntosMaximos: 15,
            licenses: licenses || []
        });

        await driverRepository.save(driver);
        return res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Error registering user', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const driver = await driverRepository.findOne({ where: { email } });
        if (!driver) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!driver.password) {
            return res.status(401).json({ message: 'Invalid credentials (no password set)' });
        }

        const isMatch = await bcrypt.compare(password, driver.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: driver.id, role: driver.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const { password: _, ...driverWithoutPassword } = driver;

        return res.json({ token, user: driverWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Error logging in', error });
    }
};
