'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutGrid, Bell, ChevronDown, Menu, Sparkles, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/lib/auth';
import toast from 'react-hot-toast';

interface TopBarProps {
  showBack?: boolean;
  breadcrumb?: string;
  showSparkle?: boolean;
  onMenuClick?: () => void;
}

export default function TopBar({ showBack, breadcrumb = 'Assignment', showSparkle, onMenuClick }: TopBarProps) {
  const router = useRouter();
  const { teacher } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="h-14 glass rounded-[20px] px-4 flex items-center justify-between shadow-topbar">
      {/* Left: Hamburger (mobile) + Back + Breadcrumb */}
      <div className="flex items-center gap-2">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center text-muted hover:text-primary"
        >
          <Menu size={20} />
        </button>

        {/* Back button */}
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-full shadow-card flex items-center justify-center
              hover:shadow-md transition-shadow duration-200 active:scale-95"
          >
            <ArrowLeft size={18} className="text-primary" />
          </button>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5">
          {showSparkle ? (
            <>
              <Sparkles size={14} className="text-faint" />
              <span className="text-[15px] font-semibold text-faint">{breadcrumb}</span>
            </>
          ) : (
            <>
              <LayoutGrid size={16} className="text-faint hidden sm:block" />
              <span className="text-[15px] font-semibold text-faint">{breadcrumb}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Bell + User */}
      <div className="flex items-center gap-2">
        {/* Bell with orange notification dot */}
        <button 
          onClick={() => toast('No new notifications', { icon: '🔔' })}
          className="relative w-9 h-9 bg-bg-input rounded-full flex items-center justify-center hover:bg-[#e8eaed] transition-colors active:scale-95"
        >
          <Bell size={17} className="text-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange rounded-full" />
        </button>

        {/* User dropdown container */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] hover:bg-bg-input transition-colors duration-150"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {teacher?.avatarUrl ? (
                <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">
                  {teacher?.name?.charAt(0) ?? 'T'}
                </span>
              )}
            </div>
            <span className="font-semibold text-[14px] text-primary hidden sm:block">
              {teacher?.name ?? 'Teacher'}
            </span>
            <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e8eaed] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-[#e8eaed] mb-1">
                <p className="text-sm font-semibold text-[#171717] truncate">{teacher?.name}</p>
                <p className="text-xs text-[#a9a9a9] truncate">{teacher?.email}</p>
              </div>
              <button 
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/profile');
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#2f2f2f] hover:bg-[#f6f6f6] flex items-center gap-2 transition-colors"
              >
                <User size={15} className="text-muted" />
                Profile
              </button>
              <button 
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors mt-0.5"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
