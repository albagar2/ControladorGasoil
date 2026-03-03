import { AppDataSource } from "./data-source";
import { Driver } from "./entities/Driver";
import { Vehicle } from "./entities/Vehicle";
import { Refuel } from "./entities/Refuel";
import { Maintenance } from "./entities/Maintenance";
import { Family } from "./entities/Family";

async function printDump() {
    try {
        await AppDataSource.initialize();
        const data: any = {};
        data.families = await AppDataSource.getRepository(Family).find();
        data.drivers = await AppDataSource.getRepository(Driver).find();
        data.vehicles = await AppDataSource.getRepository(Vehicle).find();
        data.refuels = await AppDataSource.getRepository(Refuel).find();
        data.maintenances = await AppDataSource.getRepository(Maintenance).find();

        console.log("---START_DUMP---");
        console.log(JSON.stringify(data, null, 2));
        console.log("---END_DUMP---");

        await AppDataSource.destroy();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

printDump();
