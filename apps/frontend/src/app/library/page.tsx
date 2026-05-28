import AppShell from '@/components/layout/AppShell';
import { Clock } from 'lucide-react';

export default function LibraryPage() {
  return (
    <AppShell breadcrumb="My Library">
      <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in text-center px-4">
        <div className="w-16 h-16 bg-bg-input rounded-full flex items-center justify-center mb-6">
          <Clock size={32} className="text-orange-500" />
        </div>
        <h1 className="font-bold text-[24px] text-primary mb-2">My Library</h1>
        <p className="text-muted text-[15px] max-w-md mx-auto leading-relaxed">
          This area will contain all your saved resources, templates, and reference materials in the future.
        </p>
      </div>
    </AppShell>
  );
}
