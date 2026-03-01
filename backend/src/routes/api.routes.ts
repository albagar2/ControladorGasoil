import { Router } from 'express';
import * as VehicleController from '../controllers/vehicle.controller';
import * as DriverController from '../controllers/driver.controller';
import * as RefuelController from '../controllers/refuel.controller';
import * as AuthController from '../controllers/auth.controller';
import * as MaintenanceController from '../controllers/maintenance.controller';
import * as FamilyController from '../controllers/family.controller';
import { emailController } from '../controllers/email.controller';
import { upload } from '../middleware/upload';
import { checkJwt } from '../middleware/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - dni
 *               - email
 *               - password
 *             properties:
 *               nombre: { type: string }
 *               dni: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               telefono: { type: string }
 *               role: { type: string, enum: [admin, conductor] }
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 */
router.post('/auth/register', AuthController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', AuthController.login);

/**
 * @openapi
 * /api/vehicles:
 *   get:
 *     tags:
 *       - Vehicles
 *     summary: Get all vehicles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles
 *       401:
 *         description: Unauthorized
 */
router.get('/vehicles', checkJwt, VehicleController.getVehicles);

router.get('/vehicles/:id', checkJwt, VehicleController.getVehicleById);
router.post('/vehicles', checkJwt, VehicleController.createVehicle);
router.put('/vehicles/:id', checkJwt, VehicleController.updateVehicle);
router.delete('/vehicles/:id', checkJwt, VehicleController.deleteVehicle);


/**
 * @openapi
 * /api/drivers:
 *   get:
 *     tags:
 *       - Drivers
 *     summary: Get all drivers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of drivers
 */
router.get('/drivers', checkJwt, DriverController.getDrivers);
router.get('/drivers/:id', checkJwt, DriverController.getDriverById);
router.post('/drivers', checkJwt, DriverController.createDriver);
router.put('/drivers/:id', checkJwt, DriverController.updateDriver);
router.delete('/drivers/:id', checkJwt, DriverController.deleteDriver);

/**
 * @openapi
 * /api/refuels:
 *   get:
 *     tags:
 *       - Refuels
 *     summary: Get all refuel records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of refuels
 */
router.get('/refuels', checkJwt, RefuelController.getRefuels);
router.post('/refuels', checkJwt, upload.single('ticket'), RefuelController.createRefuel);
router.put('/refuels/:id', checkJwt, RefuelController.updateRefuel);
router.delete('/refuels/:id', checkJwt, RefuelController.deleteRefuel);

/**
 * @openapi
 * /api/maintenances:
 *   get:
 *     tags:
 *       - Maintenance
 *     summary: Get all maintenance records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of maintenances
 */
router.get('/maintenances', checkJwt, MaintenanceController.getMaintenances);
router.post('/maintenances', checkJwt, upload.single('ticket'), MaintenanceController.createMaintenance);
router.put('/maintenances/:id', checkJwt, MaintenanceController.updateMaintenance);
router.delete('/maintenances/:id', checkJwt, MaintenanceController.deleteMaintenance);

// Family Routes (Protected)
router.post('/family', checkJwt, FamilyController.createFamily);
router.post('/family/join', checkJwt, FamilyController.joinFamily);
router.get('/family/my-family', checkJwt, FamilyController.getMyFamily);

// Admin Family Routes
router.get('/families', checkJwt, FamilyController.getAllFamilies);
router.post('/families/admin', checkJwt, FamilyController.createFamilyAdmin);
router.delete('/families/:id', checkJwt, FamilyController.deleteFamily);

// Email Routes
router.post('/email/maintenance-alert', checkJwt, emailController.sendMaintenanceAlert);
router.post('/email/report', checkJwt, emailController.sendMonthlyReport);

export default router;
