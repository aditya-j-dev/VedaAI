'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { authApi, profileApi } from '@/lib/api';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';

interface AppShellProps {
  children: React.ReactNode;
  showBack?: boolean;
  breadcrumb?: string;
  showSparkle?: boolean;
}

export default function AppShell({ children, showBack, breadcrumb, showSparkle }: AppShellProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, setAuth, setLoading, teacher } = useAuthStore();
  const { setProfile, sidebarOpen, setSidebarOpen } = useAssignmentStore();

  // Hydrate session on mount
  useEffect(() => {
    if (isAuthenticated && teacher) {
      // Already hydrated from persisted store — still refresh profile
      profileApi.get()
        .then((res) => setProfile(res.data.data))
        .catch(() => {});
      setLoading(false);
      return;
    }

    // Try to restore session from cookie
    authApi.me()
      .then((res) => {
        const { teacher: t, school: s } = res.data.data;
        setAuth(
          { id: String(t._id ?? t.id), name: t.name, email: t.email, avatarUrl: t.avatarUrl, onboardingComplete: t.onboardingComplete },
          s ? { id: String(s._id ?? s.id), name: s.name, location: s.location } : null
        );
        if (!t.onboardingComplete) {
          router.replace('/auth/onboarding');
        }
      })
      .catch(() => {
        // No valid session — redirect to landing
        router.replace('/');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading state while session check runs
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[8px] flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div className="w-5 h-5 border-2 border-[#e8eaed] border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-page flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col p-3 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-[304px] p-3">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <div className="p-3 pb-0 relative z-50">
          <TopBar
            showBack={showBack}
            breadcrumb={breadcrumb}
            showSparkle={showSparkle}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 pb-20 lg:pb-3">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
