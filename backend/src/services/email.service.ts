import { google } from 'googleapis';
import nodemailer from 'nodemailer';

interface MaintenanceAlertData {
    vehiculo: string;
    tipo: string;
    fecha: Date;
}

interface AutomatedAlertData {
    title: string;
    message: string;
    detailLabel: string;
    detailValue: string;
}

class EmailService {
    private gmail: any = null;
    private transporter: any = null;
    private readonly user = process.env.SMTP_USER || 'baciapez@gmail.com';
    private readonly pass = process.env.SMTP_PASS;
    private readonly clientId = process.env.GOOGLE_CLIENT_ID;
    private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    private readonly refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    constructor() {
        this.initialize();
    }

    private initialize() {
        this.initOAuth2();
        this.initSMTP();

        if (!this.gmail && !this.transporter) {
            console.warn('⚠️ No email credentials (OAuth2 or SMTP) available.');
        }
    }

    private initOAuth2() {
        if (this.clientId && this.clientSecret && this.refreshToken) {
            try {
                const oauth2Client = new google.auth.OAuth2(
                    this.clientId,
                    this.clientSecret,
                    'https://developers.google.com/oauthplayground'
                );

                oauth2Client.setCredentials({
                    refresh_token: this.refreshToken
                });

                this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
                console.log('[EmailService] Gmail REST API (OAuth2) configured.');
            } catch (error) {
                console.warn('[EmailService] Failed to configure Gmail OAuth2:', error);
                this.gmail = null;
            }
        }
    }

    private initSMTP() {
        if (this.user && this.pass) {
            try {
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: this.user,
                        pass: this.pass,
                    },
                });
                console.log('[EmailService] SMTP (nodemailer) configured.');
            } catch (error) {
                console.error('[EmailService] Failed to configure SMTP:', error);
                this.transporter = null;
            }
        }
    }

    async verifyConnection(): Promise<boolean> {
        // 1. Try OAuth2 Verification
        if (this.gmail) {
            try {
                await this.gmail.users.getProfile({ userId: 'me' });
                console.log('📧 Gmail REST API is verified and ready.');
                return true;
            } catch (error: any) {
                console.warn('❌ Gmail REST API verification failed (likely invalid_grant). Falling back to SMTP...');
                this.gmail = null; // Disable OAuth2 for this session
            }
        }

        // 2. Try SMTP Verification
        if (this.transporter) {
            try {
                await this.transporter.verify();
                console.log('📧 SMTP connection verified and ready.');
                return true;
            } catch (error: any) {
                console.error('❌ SMTP verification failed:', error.message || error);
                this.transporter = null;
            }
        }

        return false;
    }

    private async sendMail(to: string, subject: string, html: string): Promise<any> {
        if (!this.gmail && !this.transporter) {
            this.initialize();
        }

        if (this.gmail) {
            try {
                return await this.sendViaRest(to, subject, html);
            } catch (error) {
                console.error('[EmailService] Error sending via REST API, attempting SMTP fallback...');
                this.gmail = null;
            }
        }

        if (this.transporter) {
            return this.sendViaSmtp(to, subject, html);
        }

        throw new Error('No working email service available (both OAuth2 and SMTP failed or missing).');
    }

    private async sendViaRest(to: string, subject: string, html: string): Promise<any> {
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
            `From: "Garaje Familiar" <${this.user}>`,
            `To: ${to}`,
            `Content-Type: text/html; charset=utf-8`,
            `MIME-Version: 1.0`,
            `Subject: ${utf8Subject}`,
            '',
            html,
        ];
        const message = messageParts.join('\n');
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const res = await this.gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMessage },
        });
        console.log('[EmailService] Email sent via REST API:', res.data.id);
        return res.data;
    }

    private async sendViaSmtp(to: string, subject: string, html: string): Promise<any> {
        const mailOptions = {
            from: `"Garaje Familiar" <${this.user}>`,
            to: to,
            subject: subject,
            html: html,
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log('[EmailService] Email sent via SMTP:', info.messageId);
        return info;
    }

    private wrapHtml(content: string, title?: string): string {
        return `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                ${title ? `<h2 style="color: #4f46e5; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">${title}</h2>` : ''}
                ${content}
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
                <p style="font-size: 0.85rem; color: #64748b; text-align: center;">Este es un mensaje automático de <strong>Garaje Familiar</strong>.</p>
            </div>
        `;
    }

    async sendMaintenanceAlert(to: string, data: MaintenanceAlertData) {
        const subject = `⚠️ Alerta de Mantenimiento: ${data.vehiculo}`;
        const content = `
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
        `;

        return this.sendMail(to, subject, this.wrapHtml(content, 'Recordatorio de Mantenimiento'));
    }

    async sendMonthlyReport(to: string, reportUrl: string, month: string) {
        const subject = `📊 Informe Mensual de Gastos: ${month}`;
        const content = `
            <p>Hola,</p>
            <p>El informe detallado de gastos y actividad correspondiente al mes de <strong>${month}</strong> ya ha sido generado.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${reportUrl}" style="background-color:#4f46e5; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">Ver Informe Completo</a>
            </div>
            <p>También puedes descargarlo directamente desde la sección de Analíticas en la aplicación.</p>
        `;

        return this.sendMail(to, subject, this.wrapHtml(content, 'Tu Informe Mensual'));
    }

    async sendAutomatedAlert(to: string, data: AutomatedAlertData) {
        const subject = `⚠️ Notificación: ${data.title}`;
        const content = `
            <p>${data.message}</p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>${data.detailLabel}:</strong> ${data.detailValue}</p>
            </div>
            <p>Por favor, revisa la aplicación para más detalles y acciones necesarias.</p>
        `;

        return this.sendMail(to, subject, this.wrapHtml(content, data.title));
    }
}

export const emailService = new EmailService();
