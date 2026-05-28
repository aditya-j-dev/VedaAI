import AppShell from '@/components/layout/AppShell';
import { Users } from 'lucide-react';

export default function GroupsPage() {
  return (
    <AppShell breadcrumb="My Groups">
      <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in text-center px-4">
        <div className="w-16 h-16 bg-bg-input rounded-full flex items-center justify-center mb-6">
          <Users size={32} className="text-orange-500" />
        </div>
        <h1 className="font-bold text-[24px] text-primary mb-2">My Groups</h1>
        <p className="text-muted text-[15px] max-w-md mx-auto leading-relaxed">
          This area will serve as your student groups and classroom management view in the future.
        </p>
      </div>
    </AppShell>
  );
}
