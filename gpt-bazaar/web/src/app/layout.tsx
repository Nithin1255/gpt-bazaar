import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GPT Bazaar — Admin Console',
  description: 'Real-time product catalog, Firebase Storage uploads, inventory, and order fulfillment console.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F6F8F7] text-[#0F172A] antialiased">{children}</body>
    </html>
  );
}
