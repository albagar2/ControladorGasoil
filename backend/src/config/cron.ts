import cron from 'node-cron';
import { AppDataSource } from '../data-source';
import { Vehicle } from '../entities/Vehicle';
import { alertService } from '../services/alert.service';

export const setupCronJobs = () => {
    // Run daily at 08:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily vehicle alerts check...');
        try {
            const vehicleRepository = AppDataSource.getRepository(Vehicle);
            const vehicles = await vehicleRepository.find({
                relations: ['propietario']
            });

            for (const vehicle of vehicles) {
                if (vehicle.propietario?.email) {
                    await alertService.checkAndSendAlerts(vehicle.id);
                }
            }

            console.log('Daily check completed.');
        } catch (error) {
            console.error('Error in daily cron alert:', error);
        }
    });

    console.log('Cron jobs scheduled successfully.');
};
