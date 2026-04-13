import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as ctrl from './auth.controller';

const router = Router();

router.post('/register/buyer', ctrl.registerBuyer);
router.post('/register/store', ctrl.registerStore);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authenticate, ctrl.getMe);

export default router;
