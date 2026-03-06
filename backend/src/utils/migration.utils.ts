import { AppDataSource } from '../data-source';
import { Driver } from '../entities/Driver';
import { License, LicenseType } from '../entities/License';

/**
 * Ensures that a driver has at least one license record if they have a renewal date.
 * This is useful for migrating legacy users to the new multi-license system.
 */
export async function migrateLegacyLicense(driver: Driver): Promise<Driver> {
    const licenseRepository = AppDataSource.getRepository(License);

    // If driver already has licenses or doesn't have a renewal date, we don't need to do anything
    if ((driver.licenses && driver.licenses.length > 0) || !driver.fechaRenovacionCarnet) {
        return driver;
    }

    // Check database directly just in case the relation wasn't loaded
    const count = await licenseRepository.count({ where: { driver: { id: driver.id } } });
    if (count > 0) {
        return driver;
    }

    console.log(`[Migration] Creating default license for driver ${driver.id} (${driver.nombre})`);

    const defaultLicense = licenseRepository.create({
        type: 'B' as LicenseType,
        expirationDate: driver.fechaRenovacionCarnet,
        driver: driver
    });

    await licenseRepository.save(defaultLicense);

    // Refresh driver to include the new license
    const driverRepository = AppDataSource.getRepository(Driver);
    const updatedDriver = await driverRepository.findOne({
        where: { id: driver.id },
        relations: ['licenses', 'family']
    });

    return updatedDriver || driver;
}
