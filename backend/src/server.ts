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

// 1. Configuration & Setup
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
let dbError: string | null = null;

/**
 * Configure Express middleware & basic settings
 */
function configureMiddleware() {
    // Security Header configuration
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

    // CORS configuration
    const allowedOrigins = [
        'https://familydrive.onrender.com',
        'http://localhost:4200'
    ];

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            // In development or debugging, we might allow others
            console.log(`[CORS] Debug: Origin ${origin} allowed.`);
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    app.use(express.json());
    
    // Static assets
    const uploadsDir = path.join(__dirname, '../uploads');
    app.use('/uploads', express.static(uploadsDir));

    // Request Logging
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
}

/**
 * Perform background initialization of databases and services
 */
async function bootstrap() {
    console.log('[System] Starting background initialization...');
    
    try {
        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            console.log(`[Startup] Creating uploads directory at ${uploadsDir}`);
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Initialize Database (TypeORM)
        await AppDataSource.initialize();
        console.log("✅ Data Source initialized successfully");
        dbError = null;

        // Grace period for DB synchronization
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Module-specific setup
        setupSwagger(app);
        setupCronJobs();
        startKeepAlive();

        // Email Service verification
        const isEmailReady = await emailService.verifyConnection();
        if (isEmailReady) {
            console.log("📧 Email service verified and ready.");
        } else {
            console.warn("⚠️ Email service failure. Check credentials and fallback logs.");
        }

    } catch (err: any) {
        console.error("❌ Critical failure during bootstrapping:", err);
        dbError = err.message || String(err);
    }
}

// 2. Application Routes & Flow
configureMiddleware();

// API Base Routes
app.use('/api', apiRoutes);

// Root Landing Page
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 50px; color: #333;">
            <div style="max-width: 600px; margin: auto; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background: white;">
                <h1 style="color: #4f46e5; margin-bottom: 20px;">🚗 Family Drive API</h1>
                <p style="font-size: 1.1rem; color: #666;">El backend para la gestión de vehículos familiares está activo.</p>
                <div style="margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 12px; display: inline-block;">
                    Status: <strong style="color: #10b981;">OPERATIONAL</strong>
                </div>
                <div style="margin-top: 20px;">
                    <a href="/api/status" style="color: #4f46e5; text-decoration: none; font-weight: bold; margin: 0 15px;">API Status</a>
                    <a href="/api-docs" style="color: #4f46e5; text-decoration: none; font-weight: bold; margin: 0 15px;">Documentation</a>
                </div>
            </div>
            <p style="margin-top: 40px; color: #94a3b8; font-size: 0.85rem;">&copy; ${new Date().getFullYear()} Garaje Familiar</p>
        </div>
    `);
});

// Error handling must be last
app.use(errorMiddleware);

// 3. Execution
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server successfully started on http://0.0.0.0:${PORT}`);
    bootstrap();
});

export { dbError };
