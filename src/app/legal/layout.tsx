import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const legalLinks = [
    { href: '/legal/offer', label: 'Публичная оферта' },
    { href: '/legal/pd-policy', label: 'Политика обработки ПДн (152-ФЗ)' },
    { href: '/legal/pd-consent', label: 'Согласие на обработку данных' },
    { href: '/legal/pd-distribution', label: 'Согласие на распространение (ст. 10.1)' },
    { href: '/legal/cookies', label: 'Политика файлов cookie' },
    { href: '/legal/content-rules', label: 'Правила контента (149-ФЗ)' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              CH
            </span>
            <span className="group-hover:text-blue-400 transition-colors">CardHub</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl hover:border-slate-700"
          >
            ← На главную
          </Link>
        </div>
      </header>

      {/* Быстрая навигация по юридическим документам */}
      <div className="border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto no-scrollbar">
        <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center gap-2 text-xs whitespace-nowrap">
          <span className="text-slate-500 font-semibold uppercase tracking-wider pr-2">Документы:</span>
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm shadow-xl">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500 space-y-2">
        <div>
          © 2026 CardHub. Сервис цифровых NFC-визиток. Все права защищены.
        </div>
        <div className="text-[11px] text-slate-600 max-w-xl mx-auto">
          Деятельность осуществляется в соответствии с законодательством РФ (152-ФЗ, 149-ФЗ, 242-ФЗ, 422-ФЗ).
        </div>
      </footer>
    </div>
  );
}

