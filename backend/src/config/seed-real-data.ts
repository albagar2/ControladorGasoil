import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';
import { Vehicle } from '../entities/Vehicle';
import { Family } from '../entities/Family';
import bcrypt from 'bcryptjs';

export async function syncRealUserDataAndAdmin(): Promise<void> {
    try {
        if (!AppDataSource.isInitialized) {
            console.log('[SeedSync] AppDataSource is not initialized yet. Skipping sync.');
            return;
        }

        console.log('[SeedSync] Starting synchronization of real user data & support admin...');

        const driverRepo = AppDataSource.getRepository(Driver);
        const vehicleRepo = AppDataSource.getRepository(Vehicle);
        const familyRepo = AppDataSource.getRepository(Family);

        const passwordHash = await bcrypt.hash("123456", 10);

        // 1. Sync Support Admin (controlgasoilfamiliar@gmail.com)
        let supportAdmin = await driverRepo.findOne({ where: [{ email: 'controlgasoilfamiliar@gmail.com' }, { dni: '00000000X' }] });
        if (!supportAdmin) {
            supportAdmin = driverRepo.create({
                nombre: 'Soporte Técnico Garaje Familiar',
                dni: '00000000X',
                email: 'controlgasoilfamiliar@gmail.com',
                password: passwordHash,
                role: 'admin',
                telefono: '606990974',
                fechaRenovacionCarnet: new Date('2040-01-01'),
                puntos: 15,
                puntosMaximos: 15
            });
            await driverRepo.save(supportAdmin);
            console.log('✅ Support Admin (controlgasoilfamiliar@gmail.com) created');
        } else {
            // Ensure role is admin
            if (supportAdmin.role !== 'admin') {
                supportAdmin.role = 'admin';
                await driverRepo.save(supportAdmin);
            }
        }

        // 2. Sync Default Admin (admin@example.com)
        let defaultAdmin = await driverRepo.findOne({ where: [{ email: 'admin@example.com' }, { dni: '00000000A' }] });
        if (!defaultAdmin) {
            defaultAdmin = driverRepo.create({
                nombre: 'Admin User',
                dni: '00000000A',
                email: 'admin@example.com',
                password: passwordHash,
                role: 'admin',
                telefono: '600000000',
                fechaRenovacionCarnet: new Date('2030-01-01'),
                puntos: 15,
                puntosMaximos: 15
            });
            await driverRepo.save(defaultAdmin);
            console.log('✅ Default Admin (admin@example.com) created');
        }

        // 3. Sync Families
        const familyData = [
            { nombre: 'Familia García', codigo: 'GARCIA2024' },
            { nombre: 'Familia Pérez', codigo: 'PEREZ2024' },
            { nombre: 'Familia López', codigo: 'W7DAM8' }
        ];

        const createdFamilies: { [key: string]: Family } = {};
        for (const fam of familyData) {
            let existingFam = await familyRepo.findOne({ where: { codigo: fam.codigo } });
            if (!existingFam) {
                existingFam = familyRepo.create({
                    nombre: fam.nombre,
                    codigo: fam.codigo
                });
                existingFam = await familyRepo.save(existingFam);
                console.log(`✅ Family created: ${fam.nombre} (${fam.codigo})`);
            }
            createdFamilies[fam.codigo] = existingFam;
        }

        // 4. Sync Real Users from mi_base_de_datos.sql
        let userAlbaGarcia = await driverRepo.findOne({ where: [{ email: 'baciapez@gmail.com' }, { dni: '12345678A' }] });
        if (!userAlbaGarcia) {
            userAlbaGarcia = driverRepo.create({
                nombre: 'Alba García López',
                dni: '51183452B',
                email: 'baciapez@gmail.com',
                password: passwordHash,
                role: 'leader',
                telefono: '606990974',
                fechaRenovacionCarnet: new Date('2029-08-17'),
                puntos: 12,
                puntosMaximos: 15,
                familyId: createdFamilies['GARCIA2024']?.id
            });
            userAlbaGarcia = await driverRepo.save(userAlbaGarcia);
            console.log('✅ Real User Alba García López (baciapez@gmail.com) synced');
        }

        let userJoseAntonio = await driverRepo.findOne({ where: [{ email: 'jacarrao72@gmail.com' }, { dni: '74906437A' }] });
        if (!userJoseAntonio) {
            userJoseAntonio = driverRepo.create({
                nombre: 'Jose Antonio Carrao',
                dni: '74906437A',
                email: 'jacarrao72@gmail.com',
                password: passwordHash,
                role: 'conductor',
                telefono: '649439106',
                fechaRenovacionCarnet: new Date('2028-05-15'),
                puntos: 15,
                puntosMaximos: 15,
                familyId: createdFamilies['GARCIA2024']?.id
            });
            userJoseAntonio = await driverRepo.save(userJoseAntonio);
            console.log('✅ Real User Jose Antonio Carrao (jacarrao72@gmail.com) synced');
        }

        // 5. Sync Vehicles from mi_base_de_datos.sql
        const vehiclesToSync = [
            {
                matricula: '4182HZR',
                modelo: 'Peugeot 308',
                combustible: 'Diesel' as const,
                distintivo: 'C' as const,
                anioMatriculacion: 2026,
                kilometrajeActual: 45000,
                propietario: userAlbaGarcia || userJoseAntonio || defaultAdmin,
                familyId: createdFamilies['GARCIA2024']?.id
            },
            {
                matricula: '4182HZL',
                modelo: 'Peugeot 208',
                combustible: 'Diesel' as const,
                distintivo: 'C' as const,
                anioMatriculacion: 2024,
                kilometrajeActual: 32000,
                propietario: userJoseAntonio || userAlbaGarcia || defaultAdmin,
                familyId: createdFamilies['GARCIA2024']?.id
            }

        ];

        for (const vData of vehiclesToSync) {
            let existingV = await vehicleRepo.findOne({ where: { matricula: vData.matricula } });
            if (!existingV) {
                existingV = vehicleRepo.create({
                    matricula: vData.matricula,
                    modelo: vData.modelo,
                    combustible: vData.combustible,
                    distintivo: vData.distintivo,
                    seguro_compania: 'Mapfre',
                    seguro_numero_poliza: 'POL-' + vData.matricula,
                    seguro_fecha_vencimiento: new Date('2026-12-31'),
                    seguro_cobertura: 'Terceros ampliado',
                    itv_estado: 'Pendiente',
                    itv_fecha_caducidad: new Date('2027-06-30'),
                    itv_kilometraje: vData.kilometrajeActual,
                    anioMatriculacion: vData.anioMatriculacion,
                    kilometrajeActual: vData.kilometrajeActual,
                    propietarioId: vData.propietario.id,
                    familyId: vData.familyId
                });
                await vehicleRepo.save(existingV);
                console.log(`✅ Real Vehicle synced: ${vData.modelo} (${vData.matricula})`);
            }
        }

        console.log('🎉 Data synchronization complete!');
    } catch (err) {
        console.error('[SeedSync] Error syncing real data:', err);
    }
}
