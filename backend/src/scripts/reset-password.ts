import { AppDataSource } from "../data-source";
import { Driver } from "../entities/Driver";
import * as bcrypt from 'bcryptjs';

console.log("Starting password reset script...");

AppDataSource.initialize().then(async () => {
    console.log("Database connected.");
    const driverRepository = AppDataSource.getRepository(Driver);

    const usersToReset = ['admin@example.com', 'juan@example.com'];
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    for (const email of usersToReset) {
        const driver = await driverRepository.findOne({ where: { email } });
        if (driver) {
            driver.password = hashedPassword;
            await driverRepository.save(driver);
            console.log(`Password for ${email} has been reset to: ${newPassword}`);
        } else {
            console.log(`User ${email} not found.`);
        }
    }

    console.log("Password reset process completed.");
    process.exit();
}).catch(error => {
    console.log("Error connecting to database:", error);
    process.exit(1);
});
