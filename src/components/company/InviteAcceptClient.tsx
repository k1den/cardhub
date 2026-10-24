'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface InviteAcceptClientProps {
  token: string;
  email: string;
  company: {
    id: string;
    name: string;
    brandColor: string | null;
    logoUrl: string | null;
    website: string | null;
  };
  isLoggedIn: boolean;
  currentUserEmail?: string;
}

export default function InviteAcceptClient({
  token,
  email,
  company,
  isLoggedIn,
  currentUserEmail,
}: InviteAcceptClientProps) {
  const router = useRouter();
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const brandColor = company.brandColor || '#f59e0b';

  const handleAccept = async () => {
    if (!consentGiven) {
      setError('Для присоединения необходимо предоставить согласие на управление визиткой.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentGiven: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка принятия приглашения');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: brandColor }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        {/* Company Header Card */}
        <div className="glass-panel p-8 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 shadow-2xl text-center space-y-6">
          <div className="space-y-3">
            <div
              className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden"
              style={{
                backgroundColor: `${brandColor}20`,
                borderColor: `${brandColor}40`,
                borderWidth: '1px',
                color: brandColor,
              }}
            >
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-10 h-10" />
              )}
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Приглашение в команду
              </span>
              <h1 className="text-2xl font-black text-stone-900 dark:text-white mt-1">{company.name}</h1>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  <span>{company.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 leading-relaxed text-left space-y-2">
            <p>
              Вас пригласили присоединиться к компании <strong className="text-stone-900 dark:text-white">{company.name}</strong> в качестве сотрудника.
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Приглашение отправлено на адрес: <strong className="text-stone-800 dark:text-stone-200">{email}</strong>
            </p>
          </div>

          {/* Mandatory 152-FZ Consent Screen Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Уведомление и согласие (152-ФЗ)</span>
            </div>
            <p className="text-[11px] text-amber-900 dark:text-amber-200/90 leading-relaxed">
              Принимая приглашение, вы соглашаетесь с тем, что администратор компании{' '}
              <strong>«{company.name}»</strong> сможет просматривать, редактировать и отключать
              вашу цифровую визитку, а также применять корпоративный стиль. Вы можете выйти из
              компании в любой момент в личном кабинете.
            </p>
          </div>

          {isLoggedIn ? (
            <div className="space-y-4 text-left">
              {currentUserEmail && currentUserEmail !== email && (
                <div className="text-[11px] text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                  Вы авторизованы как: <strong className="text-stone-800 dark:text-stone-200">{currentUserEmail}</strong>
                </div>
              )}

              {/* Consent Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group text-xs text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="leading-relaxed">
                  Я согласен(-на) присоединиться к компании и предоставляю согласие на управление
                  моей визиткой администратором и распространение персональных данных (ст. 10.1
                  152-ФЗ).
                </span>
              </label>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs text-center font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Вы успешно присоединились! Перенаправление...</span>
                </div>
              ) : (
                <button
                  onClick={handleAccept}
                  disabled={loading || !consentGiven}
                  className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  style={{
                    backgroundColor: brandColor,
                    boxShadow: `0 8px 24px -4px ${brandColor}40`,
                  }}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Принять приглашение</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Для принятия приглашения войдите в существующий аккаунт или зарегистрируйтесь
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/auth/login?returnUrl=/invite/${token}`}
                  className="py-3 px-4 rounded-xl text-center text-xs font-bold text-stone-700 dark:text-white bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition"
                >
                  Войти
                </Link>
                <Link
                  href={`/auth/register?email=${encodeURIComponent(
                    email
                  )}&returnUrl=/invite/${token}`}
                  className="py-3 px-4 rounded-xl text-center text-xs font-bold text-white transition shadow-lg"
                  style={{ backgroundColor: brandColor }}
                >
                  Регистрация
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
