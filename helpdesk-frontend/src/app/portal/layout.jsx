import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleGuard } from '@/components/layout/RoleGuard';

export const metadata = {
  title: 'Staff Portal — INSA IT Helpdesk',
  description: 'Submit and track IT support tickets at INSA Ethiopia.',
};

export default function PortalLayout({ children }) {
  return (
    <RoleGuard allowedRoles={['portal']}>
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
