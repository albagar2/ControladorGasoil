import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { emailService } from '../services/email.service';
import { AppDataSource } from '../data-source';
import { Vehicle } from '../entities/Vehicle';
import { Driver } from '../entities/Driver';
import { alertService } from '../services/alert.service';

export const emailController = {
    async sendMaintenanceAlert(req: ExpressRequest, res: ExpressResponse) {
        try {
            const { to, vehicleName, maintenanceType, date } = req.body;

            if (!to || !vehicleName || !maintenanceType || !date) {
                return res.status(400).json({ message: 'Faltan datos requeridos (to, vehicleName, maintenanceType, date).' });
            }

            await emailService.sendMaintenanceAlert(to, {
                vehiculo: vehicleName,
                tipo: maintenanceType,
                fecha: date
            });

            res.json({ message: 'Alerta de mantenimiento enviada con éxito.' });
        } catch (error: any) {
            console.error('Error enviando alerta de mantenimiento:', error);
            res.status(500).json({
                message: 'Error al enviar el correo de alerta.',
                details: error.message || 'Error desconocido'
            });
        }
    },

    async sendMonthlyReport(req: ExpressRequest, res: ExpressResponse) {
        try {
            const { to, reportUrl, month } = req.body;

            if (!to || !reportUrl || !month) {
                return res.status(400).json({ message: 'Faltan datos requeridos (to, reportUrl, month).' });
            }

            // Check connection first
            const isConnected = await emailService.verifyConnection();
            if (!isConnected) {
                return res.status(503).json({
                    message: 'El servicio de correo no está configurado correctamente en el servidor.',
                    error: 'SMTP Connection failing'
                });
            }

            await emailService.sendMonthlyReport(to, reportUrl, month);

            res.json({ message: 'Informe mensual enviado con éxito.' });
        } catch (error: any) {
            console.error('Error enviando informe mensual:', error);
            res.status(500).json({
                message: 'Error al enviar el correo. Verifica tu configuración SMTP.',
                details: error.message || error
            });
        }
    },

    async triggerAllAlerts(req: ExpressRequest, res: ExpressResponse) {
        try {
            console.log('[EmailController] Manual trigger: Checking all alerts...');
            const vehicleRepository = AppDataSource.getRepository(Vehicle);
            const driverRepository = AppDataSource.getRepository(Driver);

            // Vehicles
            const vehicles = await vehicleRepository.find({ relations: ['propietario'] });
            for (const vehicle of vehicles) {
                await alertService.checkAndSendAlerts(vehicle.id);
            }

            // Drivers
            const drivers = await driverRepository.find();
            for (const driver of drivers) {
                await alertService.checkDriverAlerts(driver.id);
            }

            res.json({
                message: 'Proceso de revisión de alertas finalizado.',
                details: `Se han procesado vehículos y conductores. Revisa los logs para ver envíos individuales.`
            });
        } catch (error: any) {
            console.error('Error en trigger manual de alertas:', error);
            res.status(500).json({ message: 'Error al procesar las alertas manuales.', error: error.message });
        }
    },

    async triggerMonthlySummary(req: ExpressRequest, res: ExpressResponse) {
        try {
            console.log('[EmailController] Manual trigger: Sending monthly admin summary...');
            await alertService.sendMonthlyAdminSummary();
            res.json({ message: 'Resumen mensual enviado al administrador correctamente.' });
        } catch (error: any) {
            console.error('Error en trigger manual de resumen:', error);
            res.status(500).json({ message: 'Error al enviar el resumen mensual.', error: error.message });
        }
    }
};
