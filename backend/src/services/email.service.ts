import nodemailer from 'nodemailer';

class EmailService {
    private readonly RESEND_API_KEY = process.env.RESEND_API_KEY;
    private readonly FROM_EMAIL = 'onboarding@resend.dev'; // Resend Default Test Sender
    private readonly ADMIN_EMAIL = process.env.SMTP_USER || 'controlgasoilfamiliar@gmail.com';

    constructor() {
        console.log('[EmailService] Initialized with Resend HTTP API.');
    }

    async verifyConnection() {
        if (!this.RESEND_API_KEY) {
            console.error('❌ Resend API Key missing (RESEND_API_KEY)');
            return false;
        }
        return true;
    }

    private async sendMail(to: string, subject: string, html: string) {
        if (!this.RESEND_API_KEY) {
            throw new Error('Missing RESEND_API_KEY in environment variables');
        }

        console.log(`[EmailService] Sending email to ${to} via Resend API...`);

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: this.FROM_EMAIL,
                    to: [to],
                    subject: subject,
                    html: html
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(`Resend API Error: ${JSON.stringify(result)}`);
            }

            console.log('[EmailService] Email sent successfully:', result.id);
            return result;
        } catch (error: any) {
            console.error('❌ Error in Resend API:', error.message || error);
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
