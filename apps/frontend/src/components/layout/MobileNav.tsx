'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, Library, Sparkles } from 'lucide-react';

const navItems = [
  { icon: LayoutGrid, label: 'Home', href: '/' },
  { icon: FileText, label: 'Assignments', href: '/assignments' },
  { icon: Library, label: 'Library', href: '/library' },
  { icon: Sparkles, label: 'AI Toolkit', href: '/toolkit' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark flex items-center justify-around px-4 z-40">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1 py-1"
          >
            <item.icon
              size={20}
              className={isActive ? 'text-white' : 'text-muted'}
            />
            <span className={`text-[11px] font-medium ${isActive ? 'text-white' : 'text-muted'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
