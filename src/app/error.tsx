'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client error in production
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0C0F17] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans text-stone-100">
      <div className="ambient-glow bg-rose-600/10 w-96 h-96 -top-20 -left-20" />
      <div className="ambient-glow bg-amber-700/10 w-96 h-96 -bottom-20 -right-20" />

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-6 shadow-xl shadow-rose-500/10">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-widest font-bold text-rose-400">Временная неполадка</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">Что-то пошло не так</h1>
        <p className="mt-3 text-sm text-stone-400 leading-relaxed">
          Произошла непредвиденная ошибка при обработке запроса. Мы уже зафиксировали событие. Попробуйте обновить страницу.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition shadow-lg shadow-amber-600/25 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Повторить попытку</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 font-semibold text-sm transition active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>На главную</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
