'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight, Lock } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasMinLength = password.length >= 10;
  const hasUppercase = /[A-ZА-ЯЁ]/.test(password);
  const hasDigit = /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Токен сброса пароля отсутствует в ссылке');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Введенные пароли не совпадают');
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasDigit) {
      setErrorMessage('Пароль не соответствует требованиям безопасности');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Ошибка при сбросе пароля');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setErrorMessage('Не удалось связаться с сервером.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Пароль успешно обновлен!</h3>
        <p className="text-sm text-stone-300">
          Все предыдущие активные сессии завершены в целях безопасности. Войдите с новым паролем.
        </p>
        <div className="pt-4">
          <Link
            href="/auth/login"
            className="w-full inline-flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/25 text-sm"
          >
            <span>Войти с новым паролем</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errorMessage && (
        <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
          Новый пароль
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Минимум 10 символов"
          className="w-full px-4 py-3 rounded-2xl bg-stone-850 border border-stone-750 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm font-mono"
        />

        <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-[11px]">
          <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-stone-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-400' : 'bg-stone-600'}`} />
            <span>≥ 10 символов</span>
          </div>
          <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-stone-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? 'bg-emerald-400' : 'bg-stone-600'}`} />
            <span>Заглавная буква</span>
          </div>
          <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-400' : 'text-stone-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hasDigit ? 'bg-emerald-400' : 'bg-stone-600'}`} />
            <span>Цифра</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
          Повторите новый пароль
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full px-4 py-3 rounded-2xl bg-stone-850 border border-stone-750 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm font-mono"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 text-sm active:scale-98 disabled:opacity-60"
        >
          {loading ? (
            <span>Сохранение пароля...</span>
          ) : (
            <>
              <span>Установить новый пароль</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
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
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Установка нового пароля</h2>
        <p className="mt-2 text-sm text-stone-400">
          Придумайте надежный пароль для доступа к личному кабинету
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-[32px] shadow-2xl border border-stone-800 bg-stone-900/80">
          <Suspense fallback={<div className="text-center py-6 text-stone-400 text-sm">Загрузка формы...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
