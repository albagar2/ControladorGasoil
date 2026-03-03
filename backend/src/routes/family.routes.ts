import { Router } from 'express';
import * as FamilyController from '../controllers/family.controller';
import { checkJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(checkJwt);

router.post('/', FamilyController.createFamily);
router.post('/join', FamilyController.joinFamily);
router.get('/my-family', FamilyController.getMyFamily);

// Admin routes
router.get('/admin/all', FamilyController.getAllFamilies);
router.post('/admin', FamilyController.createFamilyAdmin);
router.delete('/:id', FamilyController.deleteFamily);

export default router;
