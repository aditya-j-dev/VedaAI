import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { env } from '../config/env';

// Extend Express Request to include teacher
declare global {
  namespace Express {
    interface Request {
      teacher?: JWTPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    if (env.ENABLE_LOAD_TESTING && req.headers['x-load-test'] === 'true') {
      req.teacher = {
        teacherId: '507f1f77bcf86cd799439011',
        email: 'test-load@example.com',
        name: 'Load Tester',
        onboardingComplete: true,
      };
      return next();
    }

    const token = req.cookies?.vedaai_token;
    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const payload = verifyToken(token);
    req.teacher = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

export function requireOnboarding(req: Request, res: Response, next: NextFunction): void {
  if (!req.teacher?.onboardingComplete) {
    res.status(403).json({ success: false, message: 'Onboarding not complete', code: 'ONBOARDING_REQUIRED' });
    return;
  }
  next();
}
