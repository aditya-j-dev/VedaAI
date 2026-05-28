import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Teacher } from '../models/Teacher';
import { School } from '../models/School';
import { signToken } from '../utils/jwt';
import { env } from '../config/env';

// ─── Configure Passport Google Strategy ──────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.SERVER_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value ?? '';
        const avatarUrl = profile.photos?.[0]?.value ?? '';
        const displayName = profile.displayName ?? '';

        // Find existing teacher by Google ID or email
        let teacher = await Teacher.findOne({
          $or: [{ oauthId: profile.id, oauthProvider: 'google' }, { email }],
        });

        if (!teacher) {
          // New user — create without school (onboarding will set it)
          teacher = await Teacher.create({
            name: displayName,
            email,
            avatarUrl,
            oauthProvider: 'google',
            oauthId: profile.id,
            onboardingComplete: false,
          });
        } else if (!teacher.oauthId) {
          // Existing email user linking Google
          teacher.oauthId = profile.id;
          teacher.oauthProvider = 'google';
          teacher.avatarUrl = avatarUrl;
          await teacher.save();
        }

        done(null, teacher);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function setAuthCookie(res: Response, teacher: any): void {
  const school = teacher.schoolId;
  const token = signToken({
    teacherId: String(teacher._id),
    email: teacher.email,
    name: teacher.name,
    onboardingComplete: teacher.onboardingComplete ?? false,
  });
  res.cookie('vedaai_token', token, COOKIE_OPTIONS);
}

// ─── GET /api/auth/google ─────────────────────────────────────────────────────
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

// ─── GET /api/auth/google/callback ───────────────────────────────────────────
export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  passport.authenticate('google', { session: false }, async (err: any, teacher: any) => {
    if (err || !teacher) {
      res.redirect(`${env.CLIENT_URL}/auth?error=oauth_failed`);
      return;
    }

    setAuthCookie(res, teacher);

    if (!teacher.onboardingComplete) {
      res.redirect(`${env.CLIENT_URL}/auth/onboarding`);
    } else {
      res.redirect(`${env.CLIENT_URL}/assignments`);
    }
  })(req, res, next);
}

// ─── POST /api/auth/email/register ───────────────────────────────────────────
export async function emailRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: 'Name, email and password are required' });
      return;
    }

    const existing = await Teacher.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const teacher = await Teacher.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      oauthProvider: 'email',
      onboardingComplete: false,
    });

    setAuthCookie(res, teacher);
    res.status(201).json({
      success: true,
      data: { teacher: { id: teacher._id, name: teacher.name, email: teacher.email, onboardingComplete: false } },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/email/login ───────────────────────────────────────────────
export async function emailLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase() });
    if (!teacher || !teacher.passwordHash) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, teacher.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    setAuthCookie(res, teacher);

    let school = null;
    if (teacher.schoolId) {
      school = await School.findById(teacher.schoolId).lean();
    }

    res.json({
      success: true,
      data: {
        teacher: { id: teacher._id, name: teacher.name, email: teacher.email, avatarUrl: teacher.avatarUrl, onboardingComplete: teacher.onboardingComplete },
        school,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
export function logout(_req: Request, res: Response): void {
  res.clearCookie('vedaai_token', COOKIE_OPTIONS);
  res.json({ success: true, message: 'Logged out' });
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const teacher = await Teacher.findById(req.teacher!.teacherId).lean();
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    let school = null;
    if (teacher.schoolId) {
      school = await School.findById(teacher.schoolId).lean();
    }

    res.json({
      success: true,
      data: {
        teacher: { id: teacher._id, name: teacher.name, email: teacher.email, avatarUrl: teacher.avatarUrl, onboardingComplete: teacher.onboardingComplete },
        school,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/auth/onboarding ─────────────────────────────────────────────────
export async function completeOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, schoolName, schoolLocation } = req.body;
    if (!name || !schoolName || !schoolLocation) {
      res.status(400).json({ success: false, message: 'Name, school name and location are required' });
      return;
    }

    // Create school
    const school = await School.create({ name: schoolName, location: schoolLocation });

    // Update teacher
    const teacher = await Teacher.findByIdAndUpdate(
      req.teacher!.teacherId,
      { name, schoolId: school._id, onboardingComplete: true },
      { new: true }
    );

    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    // Issue new token with updated onboardingComplete: true
    const newToken = signToken({
      teacherId: String(teacher._id),
      email: teacher.email,
      name: teacher.name,
      onboardingComplete: true,
    });
    res.cookie('vedaai_token', newToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      data: {
        teacher: { id: teacher._id, name: teacher.name, email: teacher.email, avatarUrl: teacher.avatarUrl, onboardingComplete: true },
        school: { id: school._id, name: school.name, location: school.location },
      },
    });
  } catch (err) {
    next(err);
  }
}
