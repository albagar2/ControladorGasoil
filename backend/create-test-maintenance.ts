import { AppDataSource } from "./src/data-source";
import { Maintenance } from "./src/entities/Maintenance";
import { Vehicle } from "./src/entities/Vehicle";
import { Driver } from "./src/entities/Driver";

async function createMaintenance() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected...");

        const vehicleRepo = AppDataSource.getRepository(Vehicle);
        const driverRepo = AppDataSource.getRepository(Driver);
        const maintenanceRepo = AppDataSource.getRepository(Maintenance);

        // Get first vehicle and driver
        const vehicle = await vehicleRepo.findOne({ where: {} });
        const driver = await driverRepo.findOne({ where: {} });

        if (!vehicle || !driver) {
            console.error("No vehicle or driver found to assign maintenance to.");
            process.exit(1);
        }

        const maintenance = maintenanceRepo.create({
            vehiculo: vehicle,
            conductor: driver,
            fecha: new Date(),
            kilometraje: vehicle.kilometrajeActual + 1000,
            tipo: 'Frenos',
            costePieza: 120.50,
            costeTaller: 80.00,
            observaciones: 'Cambio de pastillas de freno delanteras (Test Record)'
        });

        await maintenanceRepo.save(maintenance);
        console.log("Maintenance record created successfully!");

        // Check for alert trigger
        // Current logic: Alert if current km >= last maintenance km + 15000
        // We just added a maintenance at current + 1000, so it shouldn't trigger yet unless we manually adjust.
        // Let's create another one that is OLDER to trigger an alert?
        // User just asked for "at least one record". This is sufficient.

        process.exit(0);
    } catch (error) {
        console.error("Error creating maintenance:", error);
        process.exit(1);
    }
}

createMaintenance();
