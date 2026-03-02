import { Request, Response } from 'express';
import { emailService } from '../services/email.service';

export const emailController = {
    async sendMaintenanceAlert(req: Request, res: Response) {
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

    async sendMonthlyReport(req: Request, res: Response) {
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
    }
};
