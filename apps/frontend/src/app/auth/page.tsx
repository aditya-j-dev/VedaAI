'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { signInWithGoogle } from '@/lib/auth';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

type Mode = 'login' | 'register';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, setAuth } = useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const oauthError = searchParams.get('error');

  useEffect(() => {
    if (isAuthenticated) router.replace('/assignments');
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (mode === 'register') {
        res = await authApi.emailRegister(name, email, password);
      } else {
        res = await authApi.emailLogin(email, password);
      }

      const { teacher, school } = res.data.data;
      setAuth(
        { id: String(teacher.id ?? teacher._id), name: teacher.name, email: teacher.email, avatarUrl: teacher.avatarUrl, onboardingComplete: teacher.onboardingComplete },
        school ? { id: String(school._id ?? school.id), name: school.name, location: school.location } : null
      );

      if (!teacher.onboardingComplete) {
        router.push('/auth/onboarding');
      } else {
        router.push('/assignments');
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <img src="/logo.png" alt="VedaAI Logo" className="h-12 w-auto object-contain" />
        <span className="font-bold text-[22px] text-[#2f2f2f] tracking-tight">VedaAI</span>
      </Link>

      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-sm border border-[#e8eaed]">
        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-[#171717] mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-[#5d5d5d] text-sm">
            {mode === 'login'
              ? 'Sign in to access your question papers'
              : 'Start generating AI question papers today'}
          </p>
        </div>

        {/* OAuth Error */}
        {oauthError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
            <AlertCircle size={15} />
            Google sign-in failed. Please try again or use email.
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={signInWithGoogle}
          className="w-full h-12 bg-white border border-[#dddddd] rounded-xl flex items-center justify-center gap-3 font-medium text-[#2f2f2f] hover:bg-[#f6f6f6] transition-colors mb-5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#e8eaed]" />
          <span className="text-[#a9a9a9] text-xs font-medium">or continue with email</span>
          <div className="flex-1 h-px bg-[#e8eaed]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9]" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-12 pl-10 pr-4 bg-[#f6f6f6] border border-[#e8eaed] rounded-xl text-sm text-[#2f2f2f] outline-none focus:border-[#a9a9a9] transition-colors placeholder:text-[#a9a9a9]"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9]" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 pl-10 pr-4 bg-[#f6f6f6] border border-[#e8eaed] rounded-xl text-sm text-[#2f2f2f] outline-none focus:border-[#a9a9a9] transition-colors placeholder:text-[#a9a9a9]"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-12 pl-10 pr-11 bg-[#f6f6f6] border border-[#e8eaed] rounded-xl text-sm text-[#2f2f2f] outline-none focus:border-[#a9a9a9] transition-colors placeholder:text-[#a9a9a9]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9] hover:text-[#5d5d5d]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#171717] rounded-xl text-white font-semibold text-sm hover:bg-[#2a2a2a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={15} className="text-orange-400" />
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-[#5d5d5d] mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-[#171717] font-semibold hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <p className="text-[#a9a9a9] text-xs mt-6 text-center max-w-xs">
        By continuing, you agree to VedaAI's terms. Your data is scoped to your account only.
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center px-4">
        <div className="w-8 h-8 border-3 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
