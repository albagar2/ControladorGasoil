import { AppDataSource } from './src/data-source';
import { Refuel } from './src/entities/Refuel';
import fs from 'fs';
import path from 'path';

const ticketsPath = 'c:/Users/bacia/Desktop/controlGasoilFamiliar/tickets';
const monthsMap: { [key: string]: number } = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
};

async function checkMatches() {
    await AppDataSource.initialize();
    const refuelRepo = AppDataSource.getRepository(Refuel);
    const allRefuels = await refuelRepo.find({ relations: ['vehiculo'] });

    console.log(`Loaded ${allRefuels.length} refuels from DB.`);

    const getFiles = (dir: string) => {
        let results: string[] = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            file = path.join(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                results = results.concat(getFiles(file));
            } else {
                results.push(file);
            }
        });
        return results;
    };

    const files = getFiles(ticketsPath);
    console.log(`Found ${files.length} ticket files.`);

    for (const file of files) {
        const basename = path.basename(file, path.extname(file)).toLowerCase().trim(); // e.g. "19 de enero"

        let matchDay: number | null = null;
        let matchMonth: number | null = null;

        // Try to parse "19 de enero" or "3 enero" or "02 de marzo"
        const parts = basename.split(/[\sde]+/);

        for (const part of parts) {
            const num = parseInt(part);
            if (!isNaN(num) && matchDay === null) {
                matchDay = num;
            } else if (monthsMap[part] !== undefined) {
                matchMonth = monthsMap[part];
            }
        }

        if (matchDay !== null && matchMonth !== null) {
            // Find refuel
            const matches = allRefuels.filter(r => {
                const d = new Date(r.fecha);
                return d.getDate() === matchDay && d.getMonth() === matchMonth;
            });

            if (matches.length === 1) {
                console.log(`[OK] Matched ${basename} -> Refuel ID ${matches[0].id} (${matches[0].vehiculo?.matricula}) on ${matches[0].fecha}`);
            } else if (matches.length > 1) {
                console.log(`[!] Multiple matches for ${basename}: found ${matches.length} refuels on that day.`);
            } else {
                console.log(`[X] No match found for ${basename}`);
            }
        } else {
            console.log(`[?] Could not parse date from ${basename}`);
        }
    }

    process.exit(0);
}

checkMatches().catch(console.error);
