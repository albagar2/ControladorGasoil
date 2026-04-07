import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

/**
 * Helper: ensures the database is connected before any query.
 * If the DataSource was never initialized (e.g. missing env vars on Render)
 * it will try to initialize it once before giving up.
 */
async function ensureDbConnected(): Promise<void> {
    if (AppDataSource.isInitialized) return;

    console.warn('[AuthService] DataSource not initialized – attempting reconnection…');
    try {
        await AppDataSource.initialize();
        console.log('[AuthService] DataSource reconnected successfully');
    } catch (err) {
        console.error('[AuthService] DataSource reconnection failed:', err);
        throw new Error('El servidor no puede conectar con la base de datos. Contacta al administrador.');
    }
}

export class AuthService {
    private static getDriverRepo() {
        return AppDataSource.getRepository(Driver);
    }

    static async register(data: any) {
        await ensureDbConnected();
        const driverRepository = this.getDriverRepo();

        const { nombre, dni, telefono, fechaRenovacionCarnet, email, password, role, licenses, puntos } = data;

        const existing = await driverRepository.findOne({ where: [{ dni }, { email }] });
        if (existing) throw new Error('Driver or Email already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const driver = driverRepository.create({
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

        await driverRepository.save(driver as any);
        return { message: 'User created successfully' };
    }

    static async login(email: string, password: string) {
        await ensureDbConnected();
        const driverRepository = this.getDriverRepo();

        const driver = await driverRepository.findOne({
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
            { expiresIn: '24h' }
        );

        const { migrateLegacyLicense } = require('../utils/migration.utils');
        const driverWithLicenses = await migrateLegacyLicense(driver);
        const { password: _, ...driverWithoutPassword } = driverWithLicenses;

        return { token, user: driverWithoutPassword };
    }
}
