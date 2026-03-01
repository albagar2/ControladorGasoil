import { AppDataSource } from "../data-source";
import { Driver } from "../entities/Driver";
import * as fs from 'fs';
import * as path from 'path';

console.log("Starting script...");

AppDataSource.initialize().then(async () => {
    console.log("Database connected.");
    const driverRepository = AppDataSource.getRepository(Driver);
    const drivers = await driverRepository.find();
    console.log(`Found ${drivers.length} drivers.`);

    let output = "---------------------------------------------------\n";
    output += "Existing Users (Passwords are hashed and not visible):\n";
    output += "---------------------------------------------------\n";

    if (drivers.length === 0) {
        output += "No users found in the database.\n";
    } else {
        drivers.forEach(driver => {
            output += `ID: ${driver.id} | Name: ${driver.nombre} | Email: ${driver.email} | Role: ${driver.role}\n`;
        });
    }
    output += "---------------------------------------------------\n";

    fs.writeFileSync(path.join(__dirname, '../../users_list.txt'), output);
    console.log("Output written to users_list.txt");
    process.exit();
}).catch(error => {
    console.log("Error connecting to database:", error);
    process.exit(1);
});
