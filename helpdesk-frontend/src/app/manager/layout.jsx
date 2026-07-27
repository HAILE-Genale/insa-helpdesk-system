import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleGuard } from '@/components/layout/RoleGuard';

export const metadata = {
  title: 'Manager View — INSA IT Helpdesk',
  description: 'Manager dashboard, escalations and reporting overview.',
};

export default function ManagerLayout({ children }) {
  return (
    <RoleGuard allowedRoles={['manager']}>
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
