import AppShell from '@/components/layout/AppShell';

export default function DashboardPage() {
  return (
    <AppShell breadcrumb="Home">
      <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in text-center px-4">
        <div className="w-16 h-16 bg-bg-input rounded-full flex items-center justify-center mb-6">
          <span className="text-2xl">📊</span>
        </div>
        <h1 className="font-bold text-[24px] text-primary mb-2">Analytics Dashboard</h1>
        <p className="text-muted text-[15px] max-w-md mx-auto leading-relaxed">
          This area will serve as your main analytics and dashboard view in the future. 
          For now, head over to the Assignments tab to manage your question papers!
        </p>
      </div>
    </AppShell>
  );
}
