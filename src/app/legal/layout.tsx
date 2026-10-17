import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-blue-500/20">
              CH
            </span>
            <span>CardHub</span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition">
            ← На главную
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm flex items-center gap-3">
          <span className="text-lg font-bold">⚠️</span>
          <span>
            <strong>Внимание:</strong> Данный документ является типовым шаблоном платформы. Перед запуском в промышленную эксплуатацию текст должен быть проверен и утвержден юристом заказчика.
          </span>
        </div>
        <div className="prose prose-invert max-w-none glass-panel p-8 rounded-2xl border border-slate-800">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        © 2026 CardHub. Все права защищены.
      </footer>
    </div>
  );
}
