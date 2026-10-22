import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Shield } from 'lucide-react';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const legalLinks = [
    { href: '/legal', label: 'Все документы' },
    { href: '/legal/offer', label: 'Оферта' },
    { href: '/legal/pd-policy', label: 'Политика ПДн (152-ФЗ)' },
    { href: '/legal/pd-consent', label: 'Согласие на обработку' },
    { href: '/legal/pd-distribution', label: 'Распространение (ст. 10.1)' },
    { href: '/legal/cookies', label: 'Cookie' },
    { href: '/legal/content-rules', label: 'Правила (149-ФЗ)' },
  ];

  return (
    <div className="min-h-screen w-full min-w-full max-w-full bg-[#0C0F17] text-stone-100 flex flex-col font-sans relative overflow-x-clip">
      {/* Soft warm ambient lighting */}
      <div className="ambient-glow bg-amber-600/10 w-96 h-96 -top-20 -left-20" />
      <div className="ambient-glow bg-orange-700/10 w-96 h-96 top-1/3 -right-24" />

      {/* Header */}
      <header className="w-full min-w-full border-b border-stone-800/80 bg-stone-900/80 backdrop-blur-md px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-amber-600/25 group-hover:scale-105 transition shrink-0">
              CH
            </span>
            <span className="font-bold tracking-tight text-white group-hover:text-amber-400 transition">CardHub</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-stone-300 hover:text-white transition flex items-center gap-1.5 bg-stone-850 border border-stone-750 px-3.5 py-2 rounded-xl hover:border-stone-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>На главную</span>
          </Link>
        </div>
      </header>

      {/* Fast Navigation Tabs over Legal Documents */}
      <div className="w-full min-w-full border-b border-stone-800/80 bg-stone-900/40 overflow-x-auto no-scrollbar">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs whitespace-nowrap">
          <span className="text-stone-500 font-semibold uppercase tracking-wider pr-2 text-[10px] flex items-center gap-1">
            <Shield className="w-3 h-3 text-amber-500" />
            <span>Юр. документы:</span>
          </span>
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/80 transition text-xs font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 w-full min-w-0 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="w-full glass-panel p-6 sm:p-10 rounded-[32px] border border-stone-800 bg-stone-900/80 shadow-2xl">
          {children}
        </div>
      </main>

      <footer className="w-full min-w-full border-t border-stone-800/80 bg-[#0A0D14] py-8 px-6 text-center text-xs text-stone-500 space-y-2 mt-auto">
        <div className="font-medium text-stone-400">
          © 2026 CardHub. Сервис цифровых NFC-визиток. Все права защищены.
        </div>
        <div className="text-[11px] text-stone-500 max-w-xl mx-auto">
          Деятельность осуществляется в строгом соответствии с законодательством РФ (152-ФЗ, 149-ФЗ, 242-ФЗ, 422-ФЗ).
        </div>
      </footer>
    </div>
  );
}
