import type { Metadata, Viewport } from 'next';
import './globals.css';
import CookieConsentBanner from '@/components/legal/CookieConsentBanner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#020617',
};

export const metadata: Metadata = {
  title: 'CardHub — Цифровые NFC-визитки нового поколения',
  description:
    'Создайте стильную цифровую визитку, делитесь ею в одно касание по NFC, через QR-код или короткую ссылку. Для частных лиц и бизнеса.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
