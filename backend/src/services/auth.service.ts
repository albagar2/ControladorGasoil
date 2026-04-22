import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';
import { Family } from '../entities/Family';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

/**
 * Helper: ensures the database is connected before any query.
 * If the DataSource was never initialized (e.g. missing env vars on Render)
 * it will try to initialize it once before giving up.
 */
let initializationPromise: Promise<void> | null = null;

/**
 * Helper: ensures the database is connected before any query.
 * Uses a singleton promise to prevent concurrent initialization attempts.
 */
async function ensureDbConnected(): Promise<void> {
    if (AppDataSource.isInitialized) return;

    if (initializationPromise) {
        return initializationPromise;
    }

    console.warn('[AuthService] DataSource not initialized – attempting connection…');
    initializationPromise = (async () => {
        try {
            await AppDataSource.initialize();
            console.log('[AuthService] DataSource connected successfully');
        } catch (err) {
            console.error('[AuthService] DataSource connection failed:', err);
            initializationPromise = null;
            throw new Error('El servidor no puede conectar con la base de datos. Contacta al administrador.');
        }
    })();

    return initializationPromise;
}

export class AuthService {
    private static getDriverRepo() {
        return AppDataSource.getRepository(Driver);
    }

    private static getFamilyRepo() {
        return AppDataSource.getRepository(Family);
    }

    static async register(data: any) {
        await ensureDbConnected();
        const driverRepository = this.getDriverRepo();
        const familyRepository = this.getFamilyRepo();

        const { 
            nombre, dni, telefono, fechaRenovacionCarnet, email, 
            password, role, licenses, puntos, 
            familyNombre, familyCodigo 
        } = data;

        const existing = await driverRepository.findOne({ where: [{ dni }, { email }] });
        if (existing) throw new Error('El DNI o Email ya están registrados.');

        let assignedFamilyId: number | undefined;
        let assignedRole = 'conductor'; // Default role

        // Security: Prevent registering as admin unless no admins exist
        if (role === 'admin') {
            const adminCount = await driverRepository.count({ where: { role: 'admin' as any } });
            if (adminCount > 0) {
                console.warn(`[AuthService] Rejected admin registration attempt for ${email}. Admin already exists.`);
                throw new Error('No se permite el registro de nuevos administradores. El sistema ya tiene un administrador configurado.');
            }
            console.log(`[AuthService] Allowing first-time admin registration for ${email}`);
            assignedRole = 'admin';
        }

        // 1. Handle Family Logic
        if (familyNombre) {
            // Create new family
            const newFamily = familyRepository.create({
                nombre: familyNombre,
                codigo: crypto.randomBytes(3).toString('hex').toUpperCase() // 6 chars unique code
            });
            const savedFamily = await familyRepository.save(newFamily);
            assignedFamilyId = savedFamily.id;
            assignedRole = 'leader'; // First user of a family is the leader
        } else if (familyCodigo) {
            // Join existing family
            const existingFamily = await familyRepository.findOne({ where: { codigo: familyCodigo.toUpperCase() } });
            if (!existingFamily) throw new Error('Código de familia no válido.');
            assignedFamilyId = existingFamily.id;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const driver = driverRepository.create({
            nombre,
            dni,
            telefono,
            fechaRenovacionCarnet,
            email,
            password: hashedPassword,
            role: assignedRole as any,
            puntos: puntos || 15,
            puntosMaximos: 15,
            familyId: assignedFamilyId,
            licenses: licenses || []
        });

        await driverRepository.save(driver as any);
        return { 
            message: 'Usuario registrado correctamente.',
            familyCode: familyNombre ? (await familyRepository.findOneBy({ id: assignedFamilyId! }))?.codigo : undefined
        };
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
