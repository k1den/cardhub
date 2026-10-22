import type { Metadata, Viewport } from 'next';
import './globals.css';
import CookieConsentBanner from '@/components/legal/CookieConsentBanner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0C0F17',
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
    <html lang="ru" className="h-full w-full max-w-full antialiased dark overflow-x-clip">
      <body className="min-h-full w-full max-w-full overflow-x-clip flex flex-col bg-[#0C0F17] text-stone-100 font-sans selection:bg-amber-600 selection:text-white">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
