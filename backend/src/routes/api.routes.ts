import { Router } from 'express';
import authRoutes from './auth.routes';
import vehicleRoutes from './vehicle.routes';
import driverRoutes from './driver.routes';
import refuelRoutes from './refuel.routes';
import maintenanceRoutes from './maintenance.routes';
import familyRoutes from './family.routes';
import emailRoutes from './email.routes';
import { AppDataSource } from '../data-source';
import * as DriverController from '../controllers/driver.controller';
import adminRoutes from './admin.routes';
import gasRoutes from './gas.routes';
import { checkJwt } from '../middleware/auth.middleware';

const router = Router();

// API Status Route
router.get('/status', async (req, res) => {
    const dbStatus = AppDataSource.isInitialized ? 'connected' : 'disconnected';
    res.json({
        message: 'Welcome to the Vehicle Management API',
        status: 'operational',
        database: dbStatus,
        timestamp: new Date()
    });
});

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/refuels', refuelRoutes);
router.use('/maintenances', maintenanceRoutes);
router.use('/family', familyRoutes);
router.use('/families', familyRoutes);
router.use('/email', emailRoutes);
router.use('/admin', adminRoutes);
router.use('/gas-prices', gasRoutes);

// Profile routes (Legacy / Shared)
router.patch('/profile', checkJwt, DriverController.updateProfile);
router.delete('/profile', checkJwt, DriverController.deleteProfile);

// Catch-all for /api routes to debug 404s
router.all('*', (req, res) => {
    console.log(`[API 404] Unmatched route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        status: 'error',
        message: `API route not found: ${req.method} ${req.originalUrl}`,
        availablePrefixes: ['/auth', '/vehicles', '/drivers', '/refuels', '/maintenances', '/family', '/email', '/status']
    });
});

export default router;
