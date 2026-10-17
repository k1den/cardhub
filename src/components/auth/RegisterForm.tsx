'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentPdProcessing, setConsentPdProcessing] = useState(false);
  const [consentOffer, setConsentOffer] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password validation helpers
  const hasMinLength = password.length >= 10;
  const hasUppercase = /[A-ZА-ЯЁ]/.test(password);
  const hasDigit = /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!consentPdProcessing) {
      setErrorMessage('Необходимо дать согласие на обработку персональных данных (152-ФЗ)');
      return;
    }

    if (!consentOffer) {
      setErrorMessage('Необходимо принять условия публичной оферты');
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasDigit) {
      setErrorMessage('Пароль не соответствует требованиям безопасности');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          consentPdProcessing,
          consentOffer,
          consentMarketing,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Произошла ошибка при регистрации');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'Регистрация прошла успешно! Проверьте вашу электронную почту.');
    } catch {
      setErrorMessage('Не удалось связаться с сервером. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing ambient light */}
      <div className="ambient-glow bg-blue-600 w-96 h-96 -top-20 -left-20" />
      <div className="ambient-glow bg-indigo-600 w-96 h-96 -bottom-20 -right-20" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4 sm:px-0">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
            CH
          </span>
          <span className="text-2xl font-black tracking-tight text-white">CardHub</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">Создайте свой аккаунт</h2>
        <p className="mt-2 text-sm text-slate-400">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="font-medium text-blue-400 hover:text-blue-300 transition">
            Войти
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-800">
          {successMessage ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Подтвердите ваш email</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{successMessage}</p>

              <p className="text-xs text-slate-400">
                Мы отправили письмо со ссылкой для подтверждения. Пожалуйста, откройте почту и перейдите по ссылке для активации аккаунта.
              </p>

              <div className="pt-2">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/30"
                >
                  Перейти на страницу входа <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.ru"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Пароль
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 10 символов"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />

                {/* Password strength criteria indicator */}
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasMinLength ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    10+ символов
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasUppercase ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    Заглавная буква
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasDigit ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${hasDigit ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    Цифра
                  </div>
                </div>
              </div>

              {/* 152-ФЗ Consents (Separate, not pre-checked) */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentPdProcessing}
                    onChange={(e) => setConsentPdProcessing(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950 transition"
                  />
                  <span className="text-xs text-slate-300 leading-snug group-hover:text-slate-200 transition">
                    Даю согласие на{' '}
                    <Link
                      href="/legal/pd-consent"
                      target="_blank"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      обработку персональных данных (152-ФЗ)
                    </Link>{' '}
                    <span className="text-rose-400">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentOffer}
                    onChange={(e) => setConsentOffer(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950 transition"
                  />
                  <span className="text-xs text-slate-300 leading-snug group-hover:text-slate-200 transition">
                    Принимаю условия{' '}
                    <Link
                      href="/legal/offer"
                      target="_blank"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      Публичной оферты
                    </Link>{' '}
                    <span className="text-rose-400">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentMarketing}
                    onChange={(e) => setConsentMarketing(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950 transition"
                  />
                  <span className="text-xs text-slate-400 leading-snug group-hover:text-slate-300 transition">
                    Согласен получать уведомления об обновлениях платформы (38-ФЗ)
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    'Регистрация...'
                  ) : (
                    <>
                      Зарегистрироваться <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400/80" />
                <span>Сервера и хранение данных в РФ (242-ФЗ)</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
