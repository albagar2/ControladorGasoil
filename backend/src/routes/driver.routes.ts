import { Router } from 'express';
import * as DriverController from '../controllers/driver.controller';
import { checkJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(checkJwt);

router.get('/', DriverController.getDrivers);
router.get('/:id', DriverController.getDriverById);
router.post('/', DriverController.createDriver);
router.put('/:id', DriverController.updateDriver);
router.delete('/:id', DriverController.deleteDriver);

export default router;
