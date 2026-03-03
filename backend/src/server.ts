import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import apiRoutes from './routes/api.routes';
import { setupSwagger } from './config/swagger';
import { setupCronJobs } from './config/cron';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', apiRoutes);

// Database Connection & Server Start
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        // Swagger Documentation
        setupSwagger(app);

        // Setup Automated Alerts
        setupCronJobs();

        // API Status Route
        app.get('/api/status', (req, res) => {
            res.json({
                message: 'Welcome to the Vehicle Management API',
                status: 'operational',
                timestamp: new Date()
            });
        });

        // Root route
        app.get('/', (req, res) => {
            res.send('Vehicle Management API is running (MySQL)');
        });

        // Global Error Handling
        app.use(errorMiddleware);

        // Start server
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`Server is running on http://0.0.0.0:${PORT}`);
            console.log(`Documentation available at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });
