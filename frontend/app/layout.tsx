import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Desk",
  description: "Ticket / Incident Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">{children}</body>
    </html>
  );
}
