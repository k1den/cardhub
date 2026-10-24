'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Lock } from 'lucide-react';

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
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Создайте свой аккаунт</h2>
        <p className="mt-2 text-sm text-stone-400">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="font-semibold text-amber-400 hover:text-amber-300 transition">
            Войти в кабинет
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-[32px] shadow-2xl border border-stone-800 bg-stone-900/80">
          {successMessage ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Подтвердите email</h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                Мы отправили ссылку для активации аккаунта на <strong className="text-white">{email}</strong>. Перейдите по ссылке в письме для завершения регистрации.
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/25 text-sm"
                >
                  <span>Перейти на страницу входа</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <span>{errorMessage}</span>
                    {errorMessage.includes('уже зарегистрирован') && (
                      <div className="mt-2.5 flex items-center gap-3 pt-2 border-t border-rose-500/20 text-xs">
                        <Link
                          href="/auth/login"
                          className="font-bold text-amber-400 hover:text-amber-300 underline"
                        >
                          Войти в аккаунт →
                        </Link>
                        <Link
                          href="/auth/forgot-password"
                          className="text-stone-300 hover:text-white underline"
                        >
                          Сбросить пароль
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                  Email <span className="text-amber-400">*</span>
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
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                  Пароль <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 10 символов"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-850 border border-stone-750 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm font-mono"
                />

                {/* Password Policy Indicators */}
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

              {/* Mandatory 152-ФЗ Consents (Separate un-checked checkboxes) */}
              <div className="space-y-3 pt-3 border-t border-stone-800">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="consent-pd"
                      type="checkbox"
                      checked={consentPdProcessing}
                      onChange={(e) => setConsentPdProcessing(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-amber-600 focus:ring-amber-500 focus:ring-offset-stone-950 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-xs leading-relaxed text-stone-400">
                    <label htmlFor="consent-pd" className="cursor-pointer">
                      Я даю согласие на{' '}
                      <Link href="/legal/pd-consent" target="_blank" className="text-amber-400 hover:underline">
                        обработку персональных данных
                      </Link>{' '}
                      в соответствии с{' '}
                      <Link href="/legal/pd-policy" target="_blank" className="text-amber-400 hover:underline">
                        Политикой конфиденциальности (152-ФЗ)
                      </Link>
                      <span className="text-rose-400 ml-0.5">*</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="consent-offer"
                      type="checkbox"
                      checked={consentOffer}
                      onChange={(e) => setConsentOffer(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-amber-600 focus:ring-amber-500 focus:ring-offset-stone-950 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-xs leading-relaxed text-stone-400">
                    <label htmlFor="consent-offer" className="cursor-pointer">
                      Я принимаю условия{' '}
                      <Link href="/legal/offer" target="_blank" className="text-amber-400 hover:underline">
                        публичной оферты
                      </Link>{' '}
                      и правил сервиса<span className="text-rose-400 ml-0.5">*</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="consent-marketing"
                      type="checkbox"
                      checked={consentMarketing}
                      onChange={(e) => setConsentMarketing(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-amber-600 focus:ring-amber-500 focus:ring-offset-stone-950 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-xs leading-relaxed text-stone-400">
                    <label htmlFor="consent-marketing" className="cursor-pointer">
                      Согласен получать информационные и сервисные рассылки (опционально)
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 text-sm active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Создание аккаунта...</span>
                  ) : (
                    <>
                      <span>Зарегистрироваться</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-stone-800 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Локализация баз данных в РФ (242-ФЗ)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
