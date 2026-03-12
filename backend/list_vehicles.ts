
import { AppDataSource } from "./src/data-source";
import { Vehicle } from "./src/entities/Vehicle";

async function listVehicles() {
    try {
        await AppDataSource.initialize();
        const vehicleRepo = AppDataSource.getRepository(Vehicle);
        const vehicles = await vehicleRepo.find();
        console.log("VEHICLES_LIST_START");
        console.log(JSON.stringify(vehicles, null, 2));
        console.log("VEHICLES_LIST_END");
        await AppDataSource.destroy();
    } catch (error) {
        console.error("Error listing vehicles:", error);
        process.exit(1);
    }
}

listVehicles();
