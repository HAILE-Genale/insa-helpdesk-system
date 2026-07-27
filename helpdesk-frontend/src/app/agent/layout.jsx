import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleGuard } from '@/components/layout/RoleGuard';

export const metadata = {
  title: 'Agent Workspace — INSA IT Helpdesk',
  description: 'IT support agent queue and ticket management.',
};

export default function AgentLayout({ children }) {
  return (
    <RoleGuard allowedRoles={['agent']}>
      <div className="min-h-screen flex flex-col bg-mesh text-slate-900">
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
