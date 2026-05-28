'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { School, MapPin, User, Sparkles, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { teacher, setAuth, school, isAuthenticated, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolLocation, setSchoolLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/auth');
      } else if (teacher?.onboardingComplete) {
        router.replace('/assignments');
      } else if (teacher?.name) {
        setName(teacher.name);
      }
    }
  }, [isAuthenticated, isLoading, teacher, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.completeOnboarding(name, schoolName, schoolLocation);
      const { teacher: t, school: s } = res.data.data;
      setAuth(
        { id: String(t.id ?? t._id), name: t.name, email: t.email, avatarUrl: t.avatarUrl, onboardingComplete: true },
        { id: String(s.id ?? s._id), name: s.name, location: s.location }
      );
      router.push('/assignments');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <img src="/logo.png" alt="VedaAI Logo" className="h-12 w-auto object-contain" />
        <span className="font-bold text-[22px] text-[#2f2f2f] tracking-tight">VedaAI</span>
      </div>

      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-sm border border-[#e8eaed]">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-1.5 bg-orange-500 rounded-full" />
          <div className="flex-1 h-1.5 bg-orange-500 rounded-full" />
          <div className="flex-1 h-1.5 bg-[#e8eaed] rounded-full" />
        </div>

        <div className="mb-7">
          <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
            <Sparkles size={22} className="text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#171717] mb-1">One last step</h1>
          <p className="text-[#5d5d5d] text-sm">
            Tell us about yourself so we can personalise your question papers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Teacher name */}
          <div>
            <label className="block text-sm font-medium text-[#2f2f2f] mb-1.5">Your Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9]" />
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-12 pl-10 pr-4 bg-[#f6f6f6] border border-[#e8eaed] rounded-xl text-sm text-[#2f2f2f] outline-none focus:border-[#a9a9a9] transition-colors placeholder:text-[#a9a9a9]"
              />
            </div>
          </div>

          {/* School name */}
          <div>
            <label className="block text-sm font-medium text-[#2f2f2f] mb-1.5">School Name</label>
            <div className="relative">
              <School size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9]" />
              <input
                type="text"
                placeholder="e.g. Delhi Public School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="w-full h-12 pl-10 pr-4 bg-[#f6f6f6] border border-[#e8eaed] rounded-xl text-sm text-[#2f2f2f] outline-none focus:border-[#a9a9a9] transition-colors placeholder:text-[#a9a9a9]"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[#2f2f2f] mb-1.5">School Location</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9]" />
              <input
                type="text"
                placeholder="e.g. New Delhi"
                value={schoolLocation}
                onChange={(e) => setSchoolLocation(e.target.value)}
                required
                className="w-full h-12 pl-10 pr-4 bg-[#f6f6f6] border border-[#e8eaed] rounded-xl text-sm text-[#2f2f2f] outline-none focus:border-[#a9a9a9] transition-colors placeholder:text-[#a9a9a9]"
              />
            </div>
            <p className="text-[#a9a9a9] text-xs mt-1.5">
              This appears on your printed question papers as the school header.
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#171717] rounded-xl text-white font-semibold text-sm hover:bg-[#2a2a2a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Go to Dashboard
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
