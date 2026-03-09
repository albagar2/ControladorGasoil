import nodemailer from 'nodemailer'; // Keeping for type compatibility if needed elsewhere, but mostly unused now

class EmailService {
    private readonly API_KEY = process.env.RESEND_API_KEY;
    private readonly FROM_EMAIL = 'onboarding@resend.dev'; // Default Resend test email

    constructor() {
        console.log('[EmailService] Initialized with Resend HTTP API strategy.');
    }

    async verifyConnection() {
        if (!this.API_KEY) {
            console.error('❌ Resend API Key missing. Please set RESEND_API_KEY in Render env.');
            return false;
        }
        console.log('✅ Resend API Key detected (HTTP Mode)');
        return true;
    }

    private async callResend(to: string, subject: string, html: string) {
        if (!this.API_KEY) {
            throw new Error('Missing RESEND_API_KEY');
        }

        try {
            // Using global fetch (Node 18+)
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    from: `Garaje Familiar <${this.FROM_EMAIL}>`,
                    to: [to],
                    subject,
                    html
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(JSON.stringify(result));
            }

            return result;
        } catch (error: any) {
            console.error('❌ Resend API Error:', error.message || error);
            throw error;
        }
    }

    async sendMaintenanceAlert(to: string, data: { vehiculo: string, tipo: string, fecha: Date }) {
        const subject = `⚠️ Alerta de Mantenimiento: ${data.vehiculo}`;
        const html = `
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
        `;

        console.log(`[EmailService] Sending via Resend to: ${to}`);
        return this.callResend(to, subject, html);
    }

    async sendMonthlyReport(to: string, reportUrl: string, month: string) {
        const subject = `📊 Informe Mensual de Gastos: ${month}`;
        const html = `
            <h2>Resumen Mensual de tu Garaje Familiar</h2>
            <p>Hola,</p>
            <p>Tu informe de gastos del mes de ${month} ya está disponible.</p>
            <p>Puedes acceder al documento a continuación o descargarlo desde la plataforma:</p>
            <a href="${reportUrl}" style="display:inline-block; padding:10px 20px; background-color:#4f46e5; color:#fff; text-decoration:none; border-radius:5px;">Ver Informe</a>
            <br/><br/>
            <p>Saludos,<br/>El equipo de Garaje Familiar</p>
        `;

        console.log(`[EmailService] Sending Monthly Report via Resend to: ${to}`);
        return this.callResend(to, subject, html);
    }

    async sendAutomatedAlert(to: string, data: { title: string, message: string, detailLabel: string, detailValue: string }) {
        const subject = `⚠️ Notificación: ${data.title}`;
        const html = `
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
        `;

        console.log(`[EmailService] Sending Automated Alert via Resend to: ${to}`);
        return this.callResend(to, subject, html);
    }
}

export const emailService = new EmailService();
