import { Router } from 'express';
import * as VehicleController from '../controllers/vehicle.controller';
import { checkJwt } from '../middleware/auth.middleware';
import { validateFields } from '../middleware/validation.middleware';

const router = Router();

router.use(checkJwt);

router.get('/', VehicleController.getVehicles);
router.get('/:id', VehicleController.getVehicleById);
router.post('/', validateFields(['matricula', 'modelo', 'combustible']), VehicleController.createVehicle);
router.put('/:id', VehicleController.updateVehicle);
router.delete('/:id', VehicleController.deleteVehicle);

export default router;
