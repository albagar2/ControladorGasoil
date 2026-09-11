/**
 * Servidor Principal de la Aplicación Backend (Express + TypeORM).
 * 
 * Este archivo configura:
 * 1. Cabeceras de seguridad (Helmet), políticas CORS y limitadores de velocidad.
 * 2. Conexión e inicialización de la base de datos PostgreSQL en Supabase.
 * 3. Enrutamiento principal de la API (/api/auth, /api/vehicles, /api/drivers, etc.).
 * 4. Compatibilidad híbrida para ejecución tradicional Node.js y Vercel Serverless.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import 'reflect-metadata';

import { AppDataSource } from './data-source';
import apiRoutes from './routes/api.routes';
import { setupSwagger } from './config/swagger';
import { setupCronJobs } from './config/cron';
import { startKeepAlive } from './services/keep-alive.service';
import { errorMiddleware } from './middleware/error.middleware';
import { emailService } from './services/email.service';
import { globalLimiter } from './middleware/rate-limit.middleware';
import { syncRealUserDataAndAdmin } from './config/seed-real-data';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
let dbError: string | null = null;

// Configuración de proxy confiable para limitar velocidad de peticiones en Vercel/Render
app.set('trust proxy', 1);

/**
 * Configura los middlewares globales de Express: seguridad, CORS, parser JSON y logs.
 */
function configureMiddleware() {
    // Configuración de cabeceras HTTP de seguridad con Helmet
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                "default-src": ["'self'"],
                "img-src": ["'self'", "data:", "https://*"],
                "connect-src": ["'self'", "https://*"],
            }
        }
    }));

    // Orígenes de dominios autorizados para CORS
    const allowedOrigins = [
        'https://familydrive.onrender.com',
        'http://localhost:4200'
    ];

    if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
    }
    if (process.env.ALLOWED_ORIGINS) {
        allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
    }

    app.use(cors({
        origin: (origin, callback) => {
            if (
                !origin || 
                allowedOrigins.includes(origin) || 
                origin.endsWith('.up.railway.app') || 
                origin.endsWith('.railway.app') ||
                origin.endsWith('.vercel.app') ||
                origin.endsWith('.onrender.com')
            ) {
                return callback(null, true);
            }
            console.log(`[CORS] Origen permitido: ${origin}`);
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Parsing del cuerpo de las peticiones en JSON
    app.use(express.json());
    
    // Aplicación del limitador global de peticiones (Rate Limiting)
    app.use(globalLimiter);
    
    // Directorio de archivos estáticos subidos
    const uploadsDir = path.join(__dirname, '../uploads');
    app.use('/uploads', express.static(uploadsDir));

    // Logging en consola de cada petición HTTP recibida
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
}

/**
 * Inicializa la base de datos TypeORM y los servicios del sistema en segundo plano.
 */
async function bootstrap() {
    console.log('[System] Iniciando servicios del servidor backend...');
    
    try {
        // Asegurar la existencia del directorio de uploads
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            console.log(`[Startup] Creando directorio de descargas en ${uploadsDir}`);
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Inicializar la conexión a PostgreSQL Supabase
        await AppDataSource.initialize();
        console.log("✅ Base de datos PostgreSQL Supabase inicializada con éxito");
        dbError = null;

        // Sincronizar cuenta de soporte técnico y datos de usuarios reales
        syncRealUserDataAndAdmin().catch(console.error);

        // Período de espera para sincronización completa
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Configuración de módulos adicionales
        setupSwagger(app);
        setupCronJobs();
        startKeepAlive();

        // Verificación de conectividad del servicio de correo SMTP
        const isEmailReady = await emailService.verifyConnection();
        if (isEmailReady) {
            console.log("📧 Servicio de correo electrónico listo.");
        } else {
            console.warn("⚠️ Servicio de correo sin verificar. Revisa credenciales.");
        }

        // Preparación de carpetas en Google Drive
        const { DriveService } = require('./services/drive.service');
        DriveService.prepareMonthlyFolders().catch(console.error);

    } catch (err: any) {
        console.error("❌ Error crítico en el inicio de servicios:", err);
        dbError = err.message || String(err);
    }
}

// Configurar middlewares de la aplicación
configureMiddleware();

// Middleware para asegurar la conexión a la base de datos en Vercel Serverless
let vercelSyncDone = false;
app.use(async (req, res, next) => {
    if (!AppDataSource.isInitialized) {
        try {
            await AppDataSource.initialize();
            console.log("✅ Base de Datos conectada en Vercel Serverless");
        } catch (err: any) {
            console.error("❌ Error al conectar Base de Datos en Serverless:", err);
        }
    }
    if (AppDataSource.isInitialized && !vercelSyncDone) {
        vercelSyncDone = true;
        syncRealUserDataAndAdmin().catch(console.error);
    }
    next();
});

// Definición de Rutas de la API (Soporta /api y la raíz en Serverless Vercel)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Página Inicial de Estado del Backend
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 50px; color: #333;">
            <div style="max-width: 600px; margin: auto; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background: white;">
                <h1 style="color: #4f46e5; margin-bottom: 20px;">🚗 Garaje Familiar API</h1>
                <p style="font-size: 1.1rem; color: #666;">El backend para la gestión de vehículos familiares está activo.</p>
                <div style="margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 12px; display: inline-block;">
                    Estado: <strong style="color: #10b981;">OPERATIVO</strong>
                </div>
                <div style="margin-top: 20px;">
                    <a href="/api/status" style="color: #4f46e5; text-decoration: none; font-weight: bold; margin: 0 15px;">Estado API</a>
                    <a href="/api-docs" style="color: #4f46e5; text-decoration: none; font-weight: bold; margin: 0 15px;">Documentación</a>
                </div>
            </div>
            <p style="margin-top: 40px; color: #94a3b8; font-size: 0.85rem;">&copy; ${new Date().getFullYear()} Garaje Familiar</p>
        </div>
    `);
});

// Middleware global para captura de errores (debe ser el último middleware)
app.use(errorMiddleware);

// Ejecución según el entorno (Servidor Tradicional vs Vercel Serverless)
if (process.env.VERCEL !== '1') {
    (async () => {
        try {
            await bootstrap();
            app.listen(Number(PORT), '0.0.0.0', () => {
                console.log(`🚀 Servidor ejecutándose en http://0.0.0.0:${PORT}`);
            });
        } catch (err) {
            console.error('Error al iniciar el servidor:', err);
            process.exit(1);
        }
    })();
} else {
    // Inicialización en segundo plano para Serverless
    bootstrap().catch(console.error);
}

export default app;
export { dbError };
