import nodemailer from 'nodemailer';

class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private readonly user = process.env.SMTP_USER || 'baciapez@gmail.com';
    private readonly clientId = process.env.GOOGLE_CLIENT_ID;
    private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    private readonly refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    constructor() {
        this.initTransporter();
    }

    private initTransporter() {
        if (!this.clientId || !this.clientSecret || !this.refreshToken) {
            console.warn('⚠️ Gmail OAuth2 credentials missing. Email service will not be available.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: this.user,
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                refreshToken: this.refreshToken
            }
        });

        console.log('[EmailService] Initialized with Gmail OAuth2.');
    }

    async verifyConnection() {
        if (!this.transporter) {
            this.initTransporter();
        }

        if (!this.transporter) return false;

        try {
            await this.transporter.verify();
            console.log('📧 Gmail OAuth2 service is ready');
            return true;
        } catch (error) {
            console.error('❌ Gmail OAuth2 verification failed:', error);
            return false;
        }
    }

    private async sendMail(to: string, subject: string, html: string) {
        if (!this.transporter) {
            this.initTransporter();
            if (!this.transporter) throw new Error('Email transporter not initialized');
        }

        console.log(`[EmailService] Sending email to ${to} via Gmail OAuth2...`);

        try {
            const info = await this.transporter.sendMail({
                from: `"Garaje Familiar" <${this.user}>`,
                to: to,
                subject: subject,
                html: html
            });

            console.log('[EmailService] Email sent successfully:', info.messageId);
            return info;
        } catch (error: any) {
            console.error('❌ Error sending email via Gmail OAuth2:', error.message || error);
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

        return this.sendMail(to, subject, html);
    }
}

export const emailService = new EmailService();
