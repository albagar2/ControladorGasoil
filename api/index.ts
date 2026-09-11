/**
 * Entry point para Vercel Serverless Functions.
 * 
 * Este archivo actúa como puente entre Vercel y el servidor Express en `backend/src/server.ts`.
 * Normaliza las peticiones entrantes eliminando el prefijo '/api' si está presente en req.url,
 * permitiendo que las rutas internas de Express (/auth/login, /vehicles, etc.) procesen las
 * solicitudes correctamente en el entorno de despliegue de Vercel.
 */
import 'reflect-metadata';
import app from '../backend/src/server';

export default async function handler(req: any, res: any) {
    try {
        // Si la ruta comienza por /api/, se remueve el prefijo para coincidir con las rutas internas
        if (req.url && req.url.startsWith('/api/')) {
            req.url = req.url.substring(4);
        } else if (req.url === '/api') {
            req.url = '/';
        }
        // Delega el procesamiento de la solicitud HTTP a la aplicación Express
        return app(req, res);
    } catch (error: any) {
        console.error('[Vercel Serverless Handler Error]:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error en la ejecución de la función Serverless',
            details: error?.message || String(error)
        });
    }
}
