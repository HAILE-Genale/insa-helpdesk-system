import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { NotificationProvider } from '@/lib/NotificationContext';
import { NotificationToast } from '@/components/notifications/NotificationToast';

export const metadata = {
  title: 'INSA Helpdesk System — Enterprise IT Helpdesk Portal',
  description: 'Enterprise IT Helpdesk and Support Ticket Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full bg-mesh text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <NotificationProvider>
            {children}
            <NotificationToast />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
