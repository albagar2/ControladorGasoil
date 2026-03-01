import { AppDataSource } from "./src/data-source";
import { Driver } from "./src/entities/Driver";
import { Vehicle } from "./src/entities/Vehicle";
import { Refuel } from "./src/entities/Refuel";
import { Maintenance } from "./src/entities/Maintenance";
import bcrypt from "bcryptjs";

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected for seeding...");

        const driverRepo = AppDataSource.getRepository(Driver);
        const vehicleRepo = AppDataSource.getRepository(Vehicle);
        const refuelRepo = AppDataSource.getRepository(Refuel);
        const maintenanceRepo = AppDataSource.getRepository(Maintenance);

        // 1. Create Users (Drivers)
        const passwordHash = await bcrypt.hash("123456", 10);

        const admin = driverRepo.create({
            nombre: "Admin User",
            dni: "00000000A",
            telefono: "600000000",
            email: "admin@example.com",
            password: passwordHash,
            role: "admin",
            fechaRenovacionCarnet: new Date("2030-01-01"),
            puntos: 15
        });

        const driver1 = driverRepo.create({
            nombre: "Alba Usuario",
            dni: "12345678Z",
            telefono: "611223344",
            email: "alba@example.com",
            password: passwordHash,
            role: "conductor",
            fechaRenovacionCarnet: new Date("2028-05-15"),
            puntos: 12
        });

        const driver2 = driverRepo.create({
            nombre: "Juan Conductor",
            dni: "87654321X",
            telefono: "699887766",
            email: "juan@example.com",
            password: passwordHash,
            role: "conductor",
            fechaRenovacionCarnet: new Date("2029-11-20"),
            puntos: 14
        });

        await driverRepo.save([admin, driver1, driver2]);
        console.log("Users created");

        // 2. Create Vehicles
        const vehicle1 = vehicleRepo.create({
            matricula: "1234 ABC",
            modelo: "Toyota Corolla",
            combustible: "Híbrido", // Fixed enum value
            distintivo: "ECO",
            anioMatriculacion: 2020,
            itvFechaCaducidad: new Date("2025-06-20"), // Fixed camelCase
            seguroFechaVencimiento: new Date("2024-12-31"), // Fixed camelCase
            kilometrajeActual: 50000,
            propietario: driver1, // Use relation instead of ID
            seguroCompañia: "Mapfre", // Fixed camelCase
            seguroNumeroPoliza: "POL-12345", // Fixed camelCase
            seguroCobertura: "Todo riesgo", // Fixed enum value and camelCase
            itvEstado: "Favorable", // Fixed enum value and camelCase
            itvKilometraje: 45000 // Fixed camelCase
        });

        await vehicleRepo.save(vehicle1);
        console.log("Vehicles created");

        // 3. Create Refuels
        const refuel1 = refuelRepo.create({
            vehiculo: vehicle1,
            conductor: driver1,
            fecha: new Date("2024-01-15"),
            kilometraje: 48000,
            litros: 40,
            precioPorLitro: 1.50,
            costeTotal: 60.00,
            proveedor: "Repsol",
            tipoCombustible: "Gasolina 95"
        });

        await refuelRepo.save(refuel1);
        console.log("Refuels created");

        // 4. Create Maintenance
        const maintenance1 = maintenanceRepo.create({
            vehiculo: vehicle1,
            conductor: driver1,
            fecha: new Date("2023-12-01"),
            kilometraje: 45000,
            tipo: "Aceite",
            costePieza: 45.50,
            costeTaller: 30.00,
            observaciones: "Cambio de aceite y filtro"
        });

        await maintenanceRepo.save(maintenance1);
        console.log("Maintenance created");

        console.log("Seeding complete!");
        await AppDataSource.destroy();

    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
}

seed();
