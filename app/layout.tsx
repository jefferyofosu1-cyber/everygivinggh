// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Every Giving - Ghana\'s Crowdfunding Platform',
  description: 'Raise money for medical, education & community causes in Ghana. Free to start. Verified in 24hrs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
