import { Request, Response } from 'express';
import { DriveService } from '../services/drive.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppDataSource } from '../data-source';
import { Refuel } from '../entities/Refuel';
import { Maintenance } from '../entities/Maintenance';
import { Vehicle } from '../entities/Vehicle';
import https from 'https';
import fs from 'fs';
import os from 'os';
import path from 'path';

const downloadFile = (url: string, dest: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            // Handle redirects just in case (though Supabase public URLs usually don't redirect, good practice)
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadFile(response.headers.location as string, dest).then(resolve).catch(reject);
            }
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

export const cleanupOldPhotos = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role } = req.user;

    if (role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Only admins can cleanup old photos" });
    }

    const deletedCount = await DriveService.cleanupOldFiles();
    res.json({ message: `Successfully deleted ${deletedCount} old photos`, deletedCount });
});

export const migratePhotos = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role } = req.user;
    if (role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
    }

    const refuelRepository = AppDataSource.getRepository(Refuel);
    const maintenanceRepository = AppDataSource.getRepository(Maintenance);

    let migratedCount = 0;

    // Migrate Refuels
    const refuels = await refuelRepository.find({ relations: ["vehiculo"] });
    for (const refuel of refuels) {
        if (refuel.ticketImageUrl && !refuel.ticketImageUrl.includes('drive.google.com')) {
            try {
                const url = refuel.ticketImageUrl;
                // Basic check for extension (or default to jpg)
                let ext = url.split('.').pop() || 'jpg';
                if (ext.length > 4 || ext.includes('/')) ext = 'jpg';

                const tempPath = path.join(os.tmpdir(), `temp_refuel_${Date.now()}.${ext}`);
                await downloadFile(url, tempPath);

                const vehicle = refuel.vehiculo;
                const dt = new Date(refuel.fecha);
                const timestamp = `${dt.getFullYear()}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}_${dt.getHours().toString().padStart(2, '0')}-${dt.getMinutes().toString().padStart(2, '0')}`;
                const cleanMatricula = vehicle ? vehicle.matricula.replace(/\s+/g, '').toUpperCase() : 'UNKNOWN';

                const fileName = `MIG_${timestamp}_${cleanMatricula}.${ext}`;
                const driveUrl = await DriveService.uploadFile(tempPath, fileName);

                if (driveUrl) {
                    refuel.ticketImageUrl = driveUrl;
                    await refuelRepository.save(refuel);
                    migratedCount++;
                }
            } catch (err) {
                console.error(`Migration error for refuel ID ${refuel.id}:`, err);
            }
        }
    }

    // Migrate Maintenances
    const maintenances = await maintenanceRepository.find({ relations: ["vehiculo"] });
    for (const maint of maintenances) {
        if (maint.ticketImageUrl && !maint.ticketImageUrl.includes('drive.google.com')) {
            try {
                const url = maint.ticketImageUrl;
                let ext = url.split('.').pop() || 'jpg';
                if (ext.length > 4 || ext.includes('/')) ext = 'jpg';

                const tempPath = path.join(os.tmpdir(), `temp_mnt_${Date.now()}.${ext}`);
                await downloadFile(url, tempPath);

                const vehicle = maint.vehiculo;
                const dt = new Date(maint.fecha);
                const timestamp = `${dt.getFullYear()}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}_${dt.getHours().toString().padStart(2, '0')}-${dt.getMinutes().toString().padStart(2, '0')}`;
                const cleanMatricula = vehicle ? vehicle.matricula.replace(/\s+/g, '').toUpperCase() : 'UNKNOWN';

                const fileName = `MNT_MIG_${timestamp}_${cleanMatricula}.${ext}`;
                const driveUrl = await DriveService.uploadFile(tempPath, fileName);

                if (driveUrl) {
                    maint.ticketImageUrl = driveUrl;
                    await maintenanceRepository.save(maint);
                    migratedCount++;
                }
            } catch (err) {
                console.error(`Migration error for maintenance ID ${maint.id}:`, err);
            }
        }
    }

    res.json({ message: "Migration complete", migratedCount });
});
