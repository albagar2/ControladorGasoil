import { Router } from 'express';
import { cleanupOldPhotos, migratePhotos, matchTicketsFolder } from '../controllers/admin.controller';
import { checkJwt } from '../middleware/auth.middleware';
import { checkAdmin } from '../middleware/admin.middleware';

const router = Router();

// Protect all admin routes
router.use(checkJwt);
router.use(checkAdmin);

router.delete('/photos/cleanup', cleanupOldPhotos);
router.post('/photos/migrate', migratePhotos);
router.post('/photos/match_local_tickets', matchTicketsFolder);

export default router;
