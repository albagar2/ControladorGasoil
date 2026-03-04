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

// Detailed Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Robust CORS Middleware
app.use(cors()); // Allow everything for debugging
app.options('*', cors()); // Ensure all OPTIONS requests are handled by CORS

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', apiRoutes);

// Root redirect to status for health checks
app.get('/', (req, res) => {
    res.redirect('/api/status');
});

// Global Error Handling
app.use(errorMiddleware);

// Start server immediately
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);

    // Initialize Database in the background
    AppDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!");
            setupSwagger(app);
            setupCronJobs();
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err);
        });
});
