import { Router } from 'express';
import * as RefuelController from '../controllers/refuel.controller';
import { checkJwt } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload';

const router = Router();

router.use(checkJwt);

router.get('/', RefuelController.getRefuels);
router.post('/', upload.single('ticket'), RefuelController.createRefuel);
router.put('/:id', RefuelController.updateRefuel);
router.delete('/:id', RefuelController.deleteRefuel);

export default router;
