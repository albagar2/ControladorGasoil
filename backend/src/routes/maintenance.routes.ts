import { Router } from 'express';
import * as MaintenanceController from '../controllers/maintenance.controller';
import { checkJwt } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload';
import { validateFields } from '../middleware/validation.middleware';

const router = Router();

router.use(checkJwt);

router.get('/', MaintenanceController.getMaintenances);
router.post('/', upload.single('ticket'), validateFields(['vehiculoId', 'fecha', 'tipo']), MaintenanceController.createMaintenance);
router.put('/:id', MaintenanceController.updateMaintenance);
router.delete('/:id', MaintenanceController.deleteMaintenance);

export default router;
