import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);

export default router;
