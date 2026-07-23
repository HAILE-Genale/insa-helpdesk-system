import './globals.css';

export const metadata = {
  title: 'INSA Helpdesk System',
  description: 'Enterprise IT Service Desk and Support Ticket Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
