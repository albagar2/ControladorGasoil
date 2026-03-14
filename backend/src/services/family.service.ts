import { AppDataSource } from '../data-source';
import { Family } from '../entities/Family';
import { Driver } from '../entities/Driver';
import { DriveService } from './drive.service';

export class FamilyService {
    private static familyRepository = AppDataSource.getRepository(Family);
    private static driverRepository = AppDataSource.getRepository(Driver);

    static async create(nombre: string, userId: number) {
        if (!nombre) throw new Error('Family name is required');

        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const family = this.familyRepository.create({
            nombre,
            codigo: code
        });

        const savedFamily = await this.familyRepository.save(family) as any as Family;

        // Assign user to this family
        const driver = await this.driverRepository.findOneBy({ id: userId });
        if (driver) {
            driver.family = savedFamily;
            await this.driverRepository.save(driver as any);
        }

        return savedFamily;
    }

    static async join(codigo: string, userId: number) {
        if (!codigo) throw new Error('Family code is required');

        const family = await this.familyRepository.findOneBy({ codigo });
        if (!family) throw new Error('Family not found');

        const driver = await this.driverRepository.findOneBy({ id: userId });
        if (!driver) throw new Error('User not found');

        driver.family = family;
        await this.driverRepository.save(driver as any);

        if (driver.email) {
            DriveService.recordDriverEmail(driver.email).catch(err => 
                console.error('[FamilyService] Failed to record email in Drive:', err)
            );
        }

        return family;
    }

    static async getMyFamily(userId: number) {
        const driver = await this.driverRepository.findOne({
            where: { id: userId },
            relations: ['family', 'family.drivers', 'family.vehicles']
        });

        if (!driver || !driver.family) return null;

        const family = driver.family;
        return {
            ...family,
            drivers: family.drivers ? family.drivers.map(d => {
                const { family, ...rest } = d;
                return rest;
            }) : [],
            vehicles: family.vehicles ? family.vehicles.map(v => {
                const { family, ...rest } = v;
                return rest;
            }) : []
        };
    }

    static async getAllAdmin() {
        const families = await this.familyRepository.find({
            relations: ['drivers', 'vehicles'],
            order: { nombre: 'ASC' }
        });

        return families.map(f => ({
            ...f,
            drivers: f.drivers ? f.drivers.map(d => {
                const { family, ...rest } = d;
                return rest;
            }) : [],
            vehicles: f.vehicles ? f.vehicles.map(v => {
                const { family, ...rest } = v;
                return rest;
            }) : []
        }));
    }

    static async createAdmin(nombre: string) {
        if (!nombre) throw new Error('Name is required');

        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const family = this.familyRepository.create({ nombre, codigo: code });
        return await this.familyRepository.save(family) as any as Family;
    }

    static async delete(id: number) {
        const family = await this.familyRepository.findOne({
            where: { id },
            relations: ['drivers', 'vehicles']
        });

        if (!family) throw new Error('Family not found');

        await this.familyRepository.remove(family);
        return true;
    }
}
