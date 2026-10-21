import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'System Maker Core India — Custom 2D PC Configurator & Compatibility Engine',
  description:
    'Design your custom desktop PC in India. Verify hardware compatibility, calculate INR pricing, get budget recommendations, and compare real components with complete transparency.',
  keywords: [
    'System Maker Core India',
    'PC Builder India',
    'Custom PC India',
    'PC Compatibility Checker',
    'Gaming PC INR Price',
    'AMD Intel PC Parts India',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className="dark">
      <body className="bg-charcoal-950 text-charcoal-100 min-h-screen flex flex-col antialiased selection:bg-magenta-accent selection:text-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
