import nodemailer from 'nodemailer';

class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || 'tucorreo@gmail.com',
                pass: process.env.SMTP_PASS || 'tu_contraseña_de_aplicacion',
            },
        });
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ SMTP Connection verified');
            return true;
        } catch (error) {
            console.error('❌ SMTP Connection failed:', error);
            return false;
        }
    }

    async sendMaintenanceAlert(to: string, data: { vehiculo: string, tipo: string, fecha: Date }) {
        console.log(`Attempting to send maintenance alert to: ${to} for vehicle: ${data.vehiculo}`);
        const mailOptions = {
            from: '"Garaje Familiar" <' + (process.env.SMTP_USER || 'no-reply@garaje.com') + '>',
            to,
            subject: `⚠️ Alerta de Mantenimiento: ${data.vehiculo}`,
            html: `
                <h2>Recordatorio de Mantenimiento Próximo</h2>
                <p>Hola,</p>
                <p>Te recordamos que tienes un mantenimiento programado para tu vehículo:</p>
                <ul>
                    <li><strong>Vehículo:</strong> ${data.vehiculo}</li>
                    <li><strong>Tipo de Mantenimiento:</strong> ${data.tipo}</li>
                    <li><strong>Fecha:</strong> ${new Date(data.fecha).toLocaleDateString()}</li>
                </ul>
                <p>Por favor, asegúrate de realizarlo a tiempo para evitar problemas.</p>
                <br/>
                <p>Saludos,<br/>El equipo de Garaje Familiar</p>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Maintenance alert sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Error in sendMaintenanceAlert:', error);
            throw error;
        }
    }

    async sendMonthlyReport(to: string, reportUrl: string, month: string) {
        console.log(`Attempting to send monthly report to: ${to} for month: ${month}`);
        const mailOptions = {
            from: '"Garaje Familiar" <' + (process.env.SMTP_USER || 'no-reply@garaje.com') + '>',
            to,
            subject: `📊 Informe Mensual de Gastos: ${month}`,
            html: `
                <h2>Resumen Mensual de tu Garaje Familiar</h2>
                <p>Hola,</p>
                <p>Tu informe de gastos del mes de ${month} ya está disponible.</p>
                <p>Puedes acceder al documento a continuación o descargarlo desde la plataforma:</p>
                <a href="${reportUrl}" style="display:inline-block; padding:10px 20px; background-color:#4f46e5; color:#fff; text-decoration:none; border-radius:5px;">Ver Informe</a>
                <br/><br/>
                <p>Saludos,<br/>El equipo de Garaje Familiar</p>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Monthly report sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Error in sendMonthlyReport:', error);
            throw error;
        }
    }

    async sendAutomatedAlert(to: string, data: { title: string, message: string, detailLabel: string, detailValue: string }) {
        console.log(`Attempting to send automated alert to: ${to} - ${data.title}`);
        const mailOptions = {
            from: '"Garaje Familiar" <' + (process.env.SMTP_USER || 'no-reply@garaje.com') + '>',
            to,
            subject: `⚠️ Notificación: ${data.title}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                    <h2 style="color: #4f46e5;">${data.title}</h2>
                    <p>${data.message}</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>${data.detailLabel}:</strong> ${data.detailValue}</p>
                    </div>
                    <p>Por favor, revisa los detalles en la aplicación para realizar las acciones necesarias.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 0.8rem; color: #9ca3af;">Este es un mensaje automático de Garaje Familiar.</p>
                </div>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Automated alert sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Error in sendAutomatedAlert:', error);
            throw error;
        }
    }
}

export const emailService = new EmailService();
