import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Modern - Open Source Package Evaluation',
  description: 'Discover and evaluate open source packages with intelligent scoring',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
