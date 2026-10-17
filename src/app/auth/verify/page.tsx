'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string>('Проверяем токен подтверждения...');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('Токен подтверждения не найден в ссылке.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setSuccess(true);
          setMessage(data.message || 'Email успешно подтвержден!');
        } else {
          setSuccess(false);
          setMessage(data.error || 'Недействительный или устаревший токен подтверждения.');
        }
      } catch {
        setSuccess(false);
        setMessage('Не удалось связаться с сервером. Попробуйте еще раз позже.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="glass-panel py-10 px-8 rounded-3xl shadow-2xl border border-slate-800 text-center space-y-6">
      {loading ? (
        <div className="space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
          <p className="text-slate-300 font-medium">Подтверждение вашего email...</p>
        </div>
      ) : success ? (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Email подтвержден!</h2>
          <p className="text-slate-300 text-sm max-w-sm mx-auto">{message}</p>
          <div className="pt-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 text-sm"
            >
              Войти в аккаунт <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Ошибка подтверждения</h2>
          <p className="text-slate-300 text-sm max-w-sm mx-auto">{message}</p>
          <div className="pt-4">
            <Link
              href="/auth/register"
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Зарегистрироваться заново
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="ambient-glow bg-blue-600 w-96 h-96 -top-20 -left-20" />
      <div className="ambient-glow bg-indigo-600 w-96 h-96 -bottom-20 -right-20" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Suspense fallback={<div className="text-center text-slate-400">Загрузка...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
