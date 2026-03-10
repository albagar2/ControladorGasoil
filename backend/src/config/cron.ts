import cron from 'node-cron';
import { AppDataSource } from '../data-source';
import { Vehicle } from '../entities/Vehicle';
import { alertService } from '../services/alert.service';

export const setupCronJobs = () => {
    // Run daily at 08:00 AM for maintenance and document alerts
    cron.schedule('0 8 * * *', async () => {
        console.log('[Cron] Running daily alerts check (Vehicles & Drivers)...');
        try {
            const vehicleRepository = AppDataSource.getRepository(Vehicle);
            const driverRepository = AppDataSource.getRepository(Driver);

            // 1. Check Vehicle Alerts (ITV, Insurance, Maintenance)
            const vehicles = await vehicleRepository.find({ relations: ['propietario'] });
            for (const vehicle of vehicles) {
                await alertService.checkAndSendAlerts(vehicle.id);
            }

            // 2. Check Driver Alerts (License)
            const drivers = await driverRepository.find();
            for (const driver of drivers) {
                await alertService.checkDriverAlerts(driver.id);
            }

            console.log('[Cron] Daily check completed.');
        } catch (error) {
            console.error('[Cron] Error in daily alert:', error);
        }
    });

    // Run monthly summary for Admin (1st day of month at 09:00 AM)
    cron.schedule('0 9 1 * *', async () => {
        console.log('[Cron] Running scheduled monthly report...');
        try {
            await alertService.sendMonthlyAdminSummary();
            console.log('[Cron] Monthly report sent successfully.');
        } catch (error) {
            console.error('[Cron] Error in monthly report:', error);
        }
    });

    console.log('Cron jobs scheduled successfully.');
};
