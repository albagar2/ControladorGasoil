import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import apiRoutes from './routes/api.routes';
import { setupSwagger } from './config/swagger';
import { setupCronJobs } from './config/cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes setup will happen after DB init

// Database Connection
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        // Swagger Documentation
        setupSwagger(app);

        // Setup Automated Alerts
        setupCronJobs();

        // API Status Route
        app.get('/api', (req, res) => {
            res.json({
                message: 'Welcome to the Vehicle Management API',
                documentation: 'http://localhost:3001/api-docs',
                status: 'operational'
            });
        });

        // Main API Routes
        app.use('/api', apiRoutes);

        // Root route
        app.get('/', (req, res) => {
            res.send('Vehicle Management API is running (MySQL)');
        });

        // Start server
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`Server is running on http://0.0.0.0:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });
