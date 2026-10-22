'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string>('Проверяем токен подтверждения...');
  const hasFired = useRef(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('Токен подтверждения не найден в ссылке.');
      return;
    }

    // Guard against React StrictMode double-execution
    if (hasFired.current) {
      return;
    }
    hasFired.current = true;

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
    <div className="glass-panel py-10 px-8 rounded-[32px] shadow-2xl border border-stone-800 bg-stone-900/80 text-center space-y-6">
      {loading ? (
        <div className="space-y-4">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
          <p className="text-stone-300 font-medium">Подтверждение вашего email...</p>
        </div>
      ) : success ? (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Email подтвержден!</h2>
          <p className="text-stone-300 text-sm max-w-sm mx-auto leading-relaxed">{message}</p>
          <div className="pt-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 py-3.5 px-6 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/25 text-sm"
            >
              <span>Войти в аккаунт</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Ошибка подтверждения</h2>
          <p className="text-stone-300 text-sm max-w-sm mx-auto leading-relaxed">{message}</p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="py-3 px-5 rounded-2xl border border-stone-800 hover:bg-stone-800 text-stone-300 text-sm transition"
            >
              Зарегистрироваться заново
            </Link>
            <Link
              href="/auth/login"
              className="py-3 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition shadow-md shadow-amber-600/20"
            >
              На страницу входа
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
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
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Suspense fallback={<div className="text-center py-6 text-stone-400 text-sm">Проверка токена...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
