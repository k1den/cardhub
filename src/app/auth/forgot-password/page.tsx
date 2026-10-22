'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Ссылка для сброса пароля отправлена, если адрес существует.');
      } else {
        setErrorMessage(data.error || 'Ошибка при запросе сброса пароля.');
      }
    } catch {
      setErrorMessage('Не удалось отправить запрос. Повторите попытку позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0F17] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-stone-100">
      {/* Soft warm ambient lighting */}
      <div className="ambient-glow bg-amber-600/10 w-96 h-96 -top-20 -left-20" />
      <div className="ambient-glow bg-orange-700/10 w-96 h-96 -bottom-20 -right-20" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4 sm:px-0">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-600/25 group-hover:scale-105 transition shrink-0">
            CH
          </span>
          <span className="text-2xl font-black tracking-tight text-white">CardHub</span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Восстановление пароля</h2>
        <p className="mt-2 text-sm text-stone-400">
          Введите ваш email, и мы отправим ссылку для установки нового пароля
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-[32px] shadow-2xl border border-stone-800 bg-stone-900/80">
          {message ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Проверьте почту</h3>
              <p className="text-sm text-stone-300 leading-relaxed">{message}</p>
              <div className="pt-3">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Вернуться на страницу входа</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.ru"
                    className="w-full px-4 py-3 rounded-2xl bg-stone-850 border border-stone-750 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm pl-11"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 text-sm active:scale-98 disabled:opacity-60"
                >
                  {loading ? (
                    <span>Отправка ссылки...</span>
                  ) : (
                    <>
                      <span>Отправить ссылку</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="text-xs text-stone-400 hover:text-stone-200 transition inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Вернуться назад ко входу</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
