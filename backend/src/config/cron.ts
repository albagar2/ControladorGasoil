import cron from 'node-cron';
import { AppDataSource } from '../data-source';
import { Vehicle } from '../entities/Vehicle';
import { emailService } from '../services/email.service';
import { LessThanOrEqual } from 'typeorm';

export const setupCronJobs = () => {
    // Run daily at 08:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily vehicle alerts check...');
        try {
            const vehicleRepository = AppDataSource.getRepository(Vehicle);

            // Calculate date 30 days from now
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            // 1. Check for ITV Expiration
            const expiringITVs = await vehicleRepository.find({
                where: {
                    itvFechaCaducidad: LessThanOrEqual(thirtyDaysFromNow)
                },
                relations: ['propietario']
            });

            for (const vehicle of expiringITVs) {
                if (vehicle.propietario?.email) {
                    await emailService.sendAutomatedAlert(vehicle.propietario.email, {
                        title: `ITV Próxima a Caducar: ${vehicle.matricula}`,
                        message: `La ITV de tu vehículo ${vehicle.modelo} (${vehicle.matricula}) caduca pronto.`,
                        detailLabel: 'Fecha de Caducidad',
                        detailValue: vehicle.itvFechaCaducidad.toLocaleDateString()
                    });
                }
            }

            // 2. Check for Insurance Expiration
            const expiringInsurance = await vehicleRepository.find({
                where: {
                    seguroFechaVencimiento: LessThanOrEqual(thirtyDaysFromNow)
                },
                relations: ['propietario']
            });

            for (const vehicle of expiringInsurance) {
                if (vehicle.propietario?.email) {
                    await emailService.sendAutomatedAlert(vehicle.propietario.email, {
                        title: `Seguro Próximo a Vencer: ${vehicle.matricula}`,
                        message: `El seguro de tu vehículo ${vehicle.modelo} (${vehicle.matricula}) vence pronto.`,
                        detailLabel: 'Fecha de Vencimiento',
                        detailValue: vehicle.seguroFechaVencimiento.toLocaleDateString()
                    });
                }
            }

            console.log('Daily check completed.');
        } catch (error) {
            console.error('Error in daily cron alert:', error);
        }
    });

    console.log('Cron jobs scheduled successfully.');
};
