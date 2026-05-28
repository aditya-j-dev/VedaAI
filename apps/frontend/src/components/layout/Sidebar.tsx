'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid, Users, FileText, BookOpen, Clock,
  Settings, Sparkles, X, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { signOut } from '@/lib/auth';

interface NavItemProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

function NavItem({ href, icon, label, active, badge, onClick }: NavItemProps) {
  const content = (
    <div
      className={`flex items-center gap-3 px-3 h-10 rounded-nav cursor-pointer transition-colors duration-150
        ${active ? 'bg-nav-active' : 'hover:bg-nav-active/50'}`}
      onClick={onClick}
    >
      <span className={`w-5 h-5 flex items-center justify-center ${active ? 'text-primary' : 'text-muted'}`}>
        {icon}
      </span>
      <span className={`flex-1 text-[15px] font-medium ${active ? 'text-primary' : 'text-muted'}`}>
        {label}
      </span>
      {badge !== undefined && (
        <span className="badge-orange">{badge}</span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { teacher, school } = useAuthStore();
  const { assignments } = useAssignmentStore();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <aside className="w-[280px] h-full bg-white rounded-[16px] shadow-sidebar flex flex-col p-5 gap-5">
      {/* Mobile close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden self-end p-1 text-muted hover:text-primary"
        >
          <X size={20} />
        </button>
      )}

      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/logo.png"
          alt="VedaAI Logo"
          className="h-15 w-auto pt-6 object-contain"
          onError={(e) => {
            // If no logo.png exists, hide the broken image and show the fallback div
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />

        {/* Fallback VedaAI 'V' Logo (hidden by default unless image fails to load) */}
        <div className="hidden w-10 h-10 bg-gradient-to-br from-[#f1813c] to-[#7a1c11] rounded-[10px] items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white font-bold text-lg leading-none">V</span>
        </div>

        <span className="font-bold text-[20px] text-primary tracking-tight">VedaAI</span>
      </div>

      {/* Create Assignment CTA */}
      <button
        onClick={() => {
          onClose?.();
          router.push('/assignments/create');
        }}
        className="w-full h-[42px] bg-create-btn rounded-pill flex items-center justify-center gap-2
          text-white font-medium text-[15px] ring-orange-glow
          hover:bg-[#1a1a1a] transition-all duration-200 active:scale-95"
      >
        <Sparkles size={15} className="text-orange" />
        Create Assignment
      </button>

      {/* Nav Menu */}
      <nav className="flex flex-col gap-0.5">
        <NavItem
          href="/dashboard"
          icon={<LayoutGrid size={18} />}
          label="Home"
          active={isActive('/dashboard') || pathname === '/'}
        />
        <NavItem
          href="/groups"
          icon={<Users size={18} />}
          label="My Groups"
          active={isActive('/groups')}
        />
        <NavItem
          href="/assignments"
          icon={<FileText size={18} />}
          label="Assignments"
          active={isActive('/assignments')}
          badge={assignments.length > 0 ? assignments.length : undefined}
        />
        <NavItem
          href="/toolkit"
          icon={<BookOpen size={18} />}
          label="AI Teacher's Toolkit"
          active={isActive('/toolkit')}
        />
        <NavItem
          href="/library"
          icon={<Clock size={18} />}
          label="My Library"
          active={isActive('/library')}
        />
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings / Profile */}
      <NavItem
        href="/profile"
        icon={<Settings size={18} />}
        label="Settings"
        active={isActive('/profile')}
      />

      {/* Sign out */}
      <div
        onClick={handleSignOut}
        className="flex items-center gap-3 px-3 h-10 rounded-nav cursor-pointer transition-colors duration-150 hover:bg-red-50 group"
      >
        <LogOut size={18} className="text-muted group-hover:text-red-500" />
        <span className="flex-1 text-[15px] font-medium text-muted group-hover:text-red-500">Sign Out</span>
      </div>

      {/* School Profile Card */}
      <div className="bg-bg-profile rounded-[16px] p-3 flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {teacher?.avatarUrl ? (
            <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-sm">
              {teacher?.name?.charAt(0) ?? 'T'}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[14px] text-primary truncate">
            {school?.name ?? 'Your School'}
          </p>
          <p className="text-[12px] text-muted truncate">
            {teacher?.name ?? ''}
          </p>
        </div>
      </div>
    </aside>
  );
}
