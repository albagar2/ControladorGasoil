import nodemailer from 'nodemailer';

class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly SMTP_USER = process.env.SMTP_USER;
    private readonly SMTP_PASS = process.env.SMTP_PASS;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.SMTP_USER,
                pass: this.SMTP_PASS
            },
            // Increased timeouts for better reliability on slow connections (Render/Cloud)
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 30000
        });
        console.log('[EmailService] Initialized with Gmail SMTP transport.');
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Conexión SMTP con Gmail verificada correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error al conectar con el servidor SMTP de Gmail:', error);
            return false;
        }
    }

    private async sendMail(to: string, subject: string, html: string) {
        if (!this.SMTP_USER || !this.SMTP_PASS) {
            throw new Error('Missing SMTP_USER or SMTP_PASS in environment variables');
        }

        const mailOptions = {
            from: `"Garaje Familiar" <${this.SMTP_USER}>`,
            to,
            subject,
            html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('[EmailService] Mensaje enviado: %s', info.messageId);
            return info;
        } catch (error: any) {
            console.error('❌ Error enviando correo:', error.message || error);
            throw error;
        }
    }

    async sendMaintenanceAlert(to: string, data: { vehiculo: string, tipo: string, fecha: Date }) {
        const subject = `⚠️ Alerta de Mantenimiento: ${data.vehiculo}`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Recordatorio de Mantenimiento</h2>
                <p>Hola,</p>
                <p>Te recordamos que tienes un mantenimiento programado para tu vehículo:</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 8px;"><strong>🚗 Vehículo:</strong> ${data.vehiculo}</li>
                        <li style="margin-bottom: 8px;"><strong>🛠️ Tipo:</strong> ${data.tipo}</li>
                        <li><strong>📅 Fecha:</strong> ${new Date(data.fecha).toLocaleDateString('es-ES')}</li>
                    </ul>
                </div>
                <p>Por favor, asegúrate de realizarlo a tiempo para mantener tu flota en perfecto estado.</p>
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
                <p style="font-size: 0.85rem; color: #64748b; text-align: center;">Este es un mensaje automático de <strong>Garaje Familiar</strong>.</p>
            </div>
        `;

        console.log(`[EmailService] Sending Maintenance Alert via SMTP to: ${to}`);
        return this.sendMail(to, subject, html);
    }

    async sendMonthlyReport(to: string, reportUrl: string, month: string) {
        const subject = `📊 Informe Mensual de Gastos: ${month}`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5; text-align: center;">Tu Informe Mensual</h2>
                <p>Hola,</p>
                <p>El informe detallado de gastos y actividad correspondiente al mes de <strong>${month}</strong> ya ha sido generado.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${reportUrl}" style="background-color:#4f46e5; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">Ver Informe Completo</a>
                </div>
                <p>También puedes descargarlo directamente desde la sección de Analíticas en la aplicación.</p>
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
                <p style="font-size: 0.85rem; color: #64748b; text-align: center;">Saludos,<br/>El equipo de <strong>Garaje Familiar</strong></p>
            </div>
        `;

        console.log(`[EmailService] Sending Monthly Report via SMTP to: ${to}`);
        return this.sendMail(to, subject, html);
    }

    async sendAutomatedAlert(to: string, data: { title: string, message: string, detailLabel: string, detailValue: string }) {
        const subject = `⚠️ Notificación: ${data.title}`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                <h2 style="color: #4f46e5; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">${data.title}</h2>
                <p>${data.message}</p>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>${data.detailLabel}:</strong> ${data.detailValue}</p>
                </div>
                <p>Por favor, revisa la aplicación para más detalles y acciones necesarias.</p>
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
                <p style="font-size: 0.85rem; color: #64748b; text-align: center;">Notificación automática de <strong>Garaje Familiar</strong>.</p>
            </div>
        `;

        console.log(`[EmailService] Sending Automated Alert via SMTP to: ${to}`);
        return this.sendMail(to, subject, html);
    }
}

export const emailService = new EmailService();
