import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JWTPayload {
  teacherId: string;
  email: string;
  name: string;
  onboardingComplete: boolean;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}
