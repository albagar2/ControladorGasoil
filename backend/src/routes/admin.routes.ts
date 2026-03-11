import { Router } from 'express';
import { cleanupOldPhotos, migratePhotos, matchTicketsFolder } from '../controllers/admin.controller';
import { checkJwt } from '../middleware/auth.middleware';

const router = Router();

router.delete('/photos/cleanup', checkJwt, cleanupOldPhotos);
router.post('/photos/migrate', checkJwt, migratePhotos);
router.post('/photos/match_local_tickets', matchTicketsFolder); // No auth for local trigger

export default router;
