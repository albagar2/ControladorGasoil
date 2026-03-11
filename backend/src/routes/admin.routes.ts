import { Router } from 'express';
import { cleanupOldPhotos, migratePhotos } from '../controllers/admin.controller';
import { checkJwt } from '../middleware/auth.middleware';

const router = Router();

router.delete('/photos/cleanup', checkJwt, cleanupOldPhotos);
router.post('/photos/migrate', checkJwt, migratePhotos);

export default router;
