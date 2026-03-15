import { Router } from 'express';
import * as FamilyController from '../controllers/family.controller';
import { checkJwt } from '../middleware/auth.middleware';
import { checkAdmin } from '../middleware/admin.middleware';

const router = Router();

router.use(checkJwt);

router.post('/', FamilyController.createFamily);
router.get('/', FamilyController.getAllFamilies); // Supports GET /api/families
router.post('/join', FamilyController.joinFamily);
router.get('/my-family', FamilyController.getMyFamily);

// Admin routes
router.get('/admin/all', checkAdmin, FamilyController.getAllFamilies);
router.post('/admin', checkAdmin, FamilyController.createFamilyAdmin);
router.delete('/:id', checkAdmin, FamilyController.deleteFamily); // Supports DELETE /api/families/:id

export default router;
