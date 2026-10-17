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
        <p className="text-sm text-slate-300">
          Все предыдущие активные сессии завершены в целях безопасности. Войдите с новым паролем.
        </p>
        <div className="pt-4">
          <Link
            href="/auth/login"
            className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 text-sm"
          >
            Войти в аккаунт <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Новый пароль
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Минимум 10 символов"
          className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
        />

        <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px]">
          <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            10+ символов
          </div>
          <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            Заглавная
          </div>
          <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hasDigit ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            Цифра
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Повторите новый пароль
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••••"
          className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition shadow-lg shadow-blue-600/30 disabled:opacity-50 text-sm"
      >
        {loading ? 'Обновление пароля...' : 'Сохранить новый пароль'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="ambient-glow bg-blue-600 w-96 h-96 -top-20 -left-20" />
      <div className="ambient-glow bg-indigo-600 w-96 h-96 -bottom-20 -right-20" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
            CH
          </span>
          <span className="text-2xl font-black tracking-tight text-white">CardHub</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">Новый пароль</h2>
        <p className="mt-2 text-sm text-slate-400">Придумайте надежный пароль для вашего аккаунта</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-800">
          <Suspense fallback={<div className="text-center text-slate-400">Загрузка...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
