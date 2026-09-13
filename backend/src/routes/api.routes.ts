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
import { dbError } from '../server';

const router = Router();

// API Status Route
const statusHandler = async (req: any, res: any) => {
    const dbStatus = AppDataSource.isInitialized ? 'connected' : 'disconnected';
    return res.status(200).json({
        message: 'Welcome to the Vehicle Management API',
        status: 'operational',
        database: dbStatus,
        error: dbStatus === 'disconnected' ? dbError : null,
        timestamp: new Date()
    });
};

router.get('/', statusHandler);
router.get('/status', statusHandler);
router.get('/api', statusHandler);
router.get('/api/status', statusHandler);

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
router.all('*', (req, res, next) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api')) {
        console.log(`[API 404] Unmatched route: ${req.method} ${req.originalUrl}`);
        return res.status(404).json({
            status: 'error',
            message: `API route not found: ${req.method} ${req.originalUrl}`,
            availablePrefixes: ['/auth', '/vehicles', '/drivers', '/refuels', '/maintenances', '/family', '/email', '/status']
        });
    }
    next();
});

export default router;
