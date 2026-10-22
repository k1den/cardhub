'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Lock, KeyRound } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [require2FA, setRequire2FA] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          totpCode: require2FA ? totpCode : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Неверные данные для входа');
        setLoading(false);
        return;
      }

      if (data.require2FA) {
        setRequire2FA(true);
        setLoading(false);
        return;
      }

      // Successful login redirect with replace
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setErrorMessage('Не удалось связаться с сервером. Повторите попытку позже.');
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
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Вход в личный кабинет</h2>
        <p className="mt-2 text-sm text-stone-400">
          Еще нет аккаунта?{' '}
          <Link href="/auth/register" className="font-semibold text-amber-400 hover:text-amber-300 transition">
            Зарегистрироваться бесплатно
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-[32px] shadow-2xl border border-stone-800 bg-stone-900/80">
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
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.ru"
                className="w-full px-4 py-3 rounded-2xl bg-stone-850 border border-stone-750 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Пароль
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-amber-400 hover:text-amber-300 transition"
                >
                  Забыли пароль?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-stone-850 border border-stone-750 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm font-mono"
              />
            </div>

            {/* 2FA TOTP Prompt (If user enabled TOTP or role mandates it) */}
            {require2FA && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wide">
                  <KeyRound className="w-4 h-4" />
                  <span>Двухфакторная аутентификация (2FA)</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Введите 6-значный одноразовый код из вашего приложения (Яндекс Ключ, Google Authenticator) или 8-значный резервный код:
                </p>
                <input
                  type="text"
                  required
                  autoFocus
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\s+/g, ''))}
                  placeholder="000000"
                  maxLength={12}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-750 text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 text-sm active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Выполняется вход...</span>
                ) : (
                  <>
                    <span>Войти</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Privacy & Security note */}
          <div className="mt-6 pt-5 border-t border-stone-800 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>Защищенное соединение по стандарту TLS 1.3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
