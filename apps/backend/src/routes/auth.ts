import { Router } from 'express';
import {
  googleAuth,
  googleCallback,
  emailRegister,
  emailLogin,
  logout,
  getMe,
  completeOnboarding,
} from '../controllers/authController';
import { requireAuth } from '../middleware/requireAuth';

const router: Router = Router();

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Email / Password
router.post('/email/register', emailRegister);
router.post('/email/login', emailLogin);

// Session management
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.put('/onboarding', requireAuth, completeOnboarding);

export default router;
