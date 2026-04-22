import { AppDataSource } from './src/data-source';
import { Driver } from './src/entities/Driver';

async function checkDrivers() {
    try {
        await AppDataSource.initialize();
        const driverRepo = AppDataSource.getRepository(Driver);
        const drivers = await driverRepo.find();
        console.log('--- Current Drivers ---');
        drivers.forEach(d => {
            console.log(`- ${d.nombre} (${d.email}) | Role: ${d.role} | DNI: ${d.dni}`);
        });
        console.log('-----------------------');
        await AppDataSource.destroy();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDrivers();
