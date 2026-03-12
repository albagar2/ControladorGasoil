import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

export class AuthService {
    private static driverRepository = AppDataSource.getRepository(Driver);

    static async register(data: any) {
        const { nombre, dni, telefono, fechaRenovacionCarnet, email, password, role, licenses, puntos } = data;

        const existing = await this.driverRepository.findOne({ where: [{ dni }, { email }] });
        if (existing) throw new Error('Driver or Email already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const driver = this.driverRepository.create({
            nombre,
            dni,
            telefono,
            fechaRenovacionCarnet,
            email,
            password: hashedPassword,
            role,
            puntos: puntos || 15,
            puntosMaximos: 15,
            licenses: licenses || []
        });

        await this.driverRepository.save(driver as any);
        return { message: 'User created successfully' };
    }

    static async login(email: string, password: string) {
        const driver = await this.driverRepository.findOne({
            where: { email },
            relations: ['licenses']
        });

        if (!driver) throw new Error('Invalid credentials');
        if (!driver.password) throw new Error('Invalid credentials (no password set)');

        const isMatch = await bcrypt.compare(password, driver.password);
        if (!isMatch) throw new Error('Invalid credentials');

        const token = jwt.sign(
            { id: driver.id, role: driver.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const { migrateLegacyLicense } = require('../utils/migration.utils');
        const driverWithLicenses = await migrateLegacyLicense(driver);
        const { password: _, ...driverWithoutPassword } = driverWithLicenses;

        return { token, user: driverWithoutPassword };
    }
}
