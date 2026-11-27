import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../components/QueryProvider';

export const metadata: Metadata = {
  title: 'GPT Bazaar — Admin Console',
  description:
    'Admin web console for managing GPT Bazaar products, Supabase Storage images, categories, mobile app settings, and live orders via FastAPI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F6F8F7] text-[#0F172A] antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
