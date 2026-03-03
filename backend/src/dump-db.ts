import { AppDataSource } from "./data-source";
import { Driver } from "./entities/Driver";
import { Vehicle } from "./entities/Vehicle";
import { Refuel } from "./entities/Refuel";
import { Maintenance } from "./entities/Maintenance";
import { Family } from "./entities/Family";
import * as fs from "fs";
import * as path from "path";

async function dump() {
    try {
        await AppDataSource.initialize();
        console.log("DataSource initialized");

        const data: any = {};

        data.families = await AppDataSource.getRepository(Family).find();
        data.drivers = await AppDataSource.getRepository(Driver).find();
        data.vehicles = await AppDataSource.getRepository(Vehicle).find();
        data.refuels = await AppDataSource.getRepository(Refuel).find();
        data.maintenances = await AppDataSource.getRepository(Maintenance).find();

        const outputPath = path.join(__dirname, "../../database_export.json");
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

        console.log(`Database dumped successfully to ${outputPath}`);
        await AppDataSource.destroy();
    } catch (error) {
        console.error("Error dumping database:", error);
        process.exit(1);
    }
}

dump();
