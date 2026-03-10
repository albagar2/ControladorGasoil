import { Router } from 'express';
import { emailController } from '../controllers/email.controller';
import { checkJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(checkJwt);

router.post('/maintenance-alert', emailController.sendMaintenanceAlert);
router.post('/report', emailController.sendMonthlyReport);
router.post('/test-alerts', emailController.triggerAllAlerts);
router.post('/test-summary', emailController.triggerMonthlySummary);

export default router;
