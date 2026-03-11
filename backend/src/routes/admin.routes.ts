import { Router } from 'express';
import { cleanupOldPhotos } from '../controllers/admin.controller';
import { checkJwt } from '../middleware/auth.middleware';

const router = Router();

router.delete('/photos/cleanup', checkJwt, cleanupOldPhotos);

export default router;
