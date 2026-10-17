'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Check } from 'lucide-react';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cardhub_cookie_consent');
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // ignore in environments without localStorage
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cardhub_cookie_consent', 'true');
      document.cookie = 'cardhub_cookie_consent=true; path=/; max-age=31536000; SameSite=Lax';
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-950/95 backdrop-blur-md space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-white">
              Безопасность и файлы cookie
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Мы используем строго необходимые технические файлы cookie для безопасной работы личного кабинета. Сервис не использует сторонние зарубежные трекеры (в соответствии с 152-ФЗ и 242-ФЗ).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            href="/legal/cookies"
            target="_blank"
            className="text-[11px] text-slate-400 hover:text-slate-200 underline transition"
          >
            Политика cookie
          </Link>

          <button
            onClick={handleAccept}
            className="py-1.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Понятно</span>
          </button>
        </div>
      </div>
    </div>
  );
}
