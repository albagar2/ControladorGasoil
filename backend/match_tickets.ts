import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { AppDataSource } from './src/data-source';
import { Refuel } from './src/entities/Refuel';
import { google } from 'googleapis';
import { DriveService } from './src/services/drive.service';
import dotenv from 'dotenv';
dotenv.config();

const ticketsPath = process.env.LOCAL_TICKETS_PATH || path.join(__dirname, 'uploads', 'tickets');
const monthsMap: { [key: string]: number } = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
};

async function matchTickets() {
    let logs: string[] = [];
    const _log = (msg: string) => {
        console.log(msg);
        logs.push(msg);
    };

    try {
        await AppDataSource.initialize();
        const refuelRepository = AppDataSource.getRepository(Refuel);
        const allRefuels = await refuelRepository.find({ relations: ['vehiculo'] });
        _log(`[DB] Connected successfully. Found ${allRefuels.length} refuels.`);

        // Log Identity
        try {
            const auth = (DriveService as any).getAuthClient();
            const drive = google.drive({ version: 'v3', auth });
            const about = await drive.about.get({ fields: 'user' });
            _log(`[DRIVE] Authenticated as: ${about.data.user?.emailAddress || 'Unknown'}`);
        } catch (e: any) {
            _log(`[DRIVE] Identity check failed: ${e.message}`);
        }

        const getFiles = (dir: string): string[] => {
            let results: string[] = [];
            if (!fs.existsSync(dir)) return [];
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                const fPath = path.join(dir, file);
                if (fs.statSync(fPath).isDirectory()) {
                    results = results.concat(getFiles(fPath));
                } else {
                    results.push(fPath);
                }
            });
            return results;
        };

        const files = getFiles(ticketsPath);
        _log(`[FS] Found ${files.length} ticket images.`);
        let uploadedCount = 0;

        for (const file of files) {
            if (file.endsWith('.tmp')) continue;
            const basename = path.basename(file, path.extname(file)).toLowerCase().trim();
            let matchDay: number | null = null;
            let matchMonth: number | null = null;

            const parts = basename.split(/[\s\-_/]+/);
            for (const part of parts) {
                if (!part || part === 'de') continue;
                const num = parseInt(part);
                if (!isNaN(num) && matchDay === null) {
                    matchDay = num;
                } else if (monthsMap[part] !== undefined) {
                    matchMonth = monthsMap[part];
                }
            }

            if (matchDay !== null && matchMonth !== null) {
                const matches = allRefuels.filter(r => {
                    const d = new Date(r.fecha);
                    return d.getDate() === matchDay && d.getMonth() === matchMonth;
                });

                if (matches.length === 1) {
                    const refuel = matches[0];
                    if (!refuel.ticketImageUrl || !refuel.ticketImageUrl.includes('drive.google.com')) {
                        _log(`Uploading ${basename} for refuel ${refuel.id}...`);
                        const dt = new Date(refuel.fecha);
                        const timestamp = `${dt.getFullYear()}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}_${dt.getHours().toString().padStart(2, '0')}-${dt.getMinutes().toString().padStart(2, '0')}`;
                        const customName = `${timestamp}_${refuel.vehiculo?.matricula.replace(/\s+/g, '').toUpperCase() || 'UNKNOWN'}${path.extname(file)}`;

                        // IMPORTANT: Need to copy the file to a tmp path, because DriveService deletes the local file on upload
                        const tmpPath = file + '.tmp';
                        fs.copyFileSync(file, tmpPath);

                        const driveUrl = await DriveService.uploadFile(tmpPath, customName);
                        if (driveUrl) {
                            refuel.ticketImageUrl = driveUrl;
                            await refuelRepository.save(refuel);
                            uploadedCount++;
                            _log(`[OK] Matched ${basename} -> Uploaded! URL: ${driveUrl}`);
                        } else {
                            _log(`[ERROR] Drive upload failed for ${basename}`);
                        }
                    } else {
                        _log(`[SKIPPED] Refuel ID ${refuel.id} already has a Drive image`);
                    }
                } else if (matches.length > 1) {
                    _log(`[!] Multiple DB matches for ${basename}`);
                } else {
                    _log(`[X] No DB match found for ${basename}`);
                }
            } else {
                _log(`[?] Could not parse date from ${basename}`);
            }
        }
        _log(`Done. Uploaded ${uploadedCount} tickets.`);
    } catch (err) {
        _log("CRITICAL ERROR: " + String(err));
    }
    fs.writeFileSync('match_results.txt', logs.join('\n'));
    process.exit(0);
}

matchTickets();
