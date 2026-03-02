import { AppDataSource } from '../data-source';
import { alertService } from '../services/alert.service';
import { Vehicle } from '../entities/Vehicle';

async function testAlerts() {
    try {
        await AppDataSource.initialize();
        console.log('Data Source initialized');

        const vehicleRepo = AppDataSource.getRepository(Vehicle);
        const vehicles = await vehicleRepo.find();

        if (vehicles.length === 0) {
            console.log('No vehicles found in database to test.');
            return;
        }

        const testVehicle = vehicles[0];
        console.log(`Testing alerts for vehicle: ${testVehicle.modelo} (${testVehicle.matricula})`);

        await alertService.checkAndSendAlerts(testVehicle.id);
        console.log('Alert check completed. Check console logs for "Automated alert sent"');

    } catch (error) {
        console.error('Error testing alerts:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

testAlerts();
