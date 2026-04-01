import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import apiRoutes from './routes/api.routes';
import { setupSwagger } from './config/swagger';
import { setupCronJobs } from './config/cron';
import { startKeepAlive } from './services/keep-alive.service';
import { errorMiddleware } from './middleware/error.middleware';
import { emailService } from './services/email.service';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Base Security
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "img-src": ["'self'", "data:", "https://*"],
        }
    }
}));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log(`[Startup] Creating uploads directory at ${uploadsDir}`);
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Detailed Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Robust CORS Middleware
const allowedOrigins = [
    'https://familydrive.onrender.com',
    'http://localhost:4200'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log(`[CORS] Origin ${origin} not explicitly allowed, but allowing for debug`);
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

// Handle all OPTIONS requests explicitly
app.options('*', cors());

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', apiRoutes);

// Root redirect to status for health checks
app.get('/', (req, res) => {
    console.log(`[${new Date().toISOString()}] Root access - redirecting to /api/status`);
    res.send(`
        <h1>Vehicle Management API (BACKEND)</h1>
        <p>Status: <a href="/api/status">Check API Status</a></p>
        <p>If you see this page on your main domain, your Render services are still swapped!</p>
    `);
});

// Global Error Handling
app.use(errorMiddleware);

// Start server immediately
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);

    // Initialize Database in the background
    AppDataSource.initialize()
        .then(async () => {
            console.log("Data Source has been initialized!");

            // Wait a bit for synchronize: true to finish and stable
            console.log("Waiting for database stabilization...");
            await new Promise(resolve => setTimeout(resolve, 5000));

            setupSwagger(app);
            setupCronJobs();
            startKeepAlive();

            // Verify Email Connection
            emailService.verifyConnection().then(success => {
                if (success) {
                    console.log("📧 Email service is ready to send alerts");
                } else {
                    console.warn("⚠️ Email service connection failed - check SMTP credentials in Render env");
                }
            });
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err);
        });
});
