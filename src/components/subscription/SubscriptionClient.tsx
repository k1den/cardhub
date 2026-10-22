'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Receipt,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface PlanData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceMonth: number;
  priceYear: number;
  maxCards: number;
  maxMembers: number;
  features: any;
}

interface SubscriptionClientProps {
  initialData: {
    subscription: any;
    plan: any;
    isActive: boolean;
    isTrial?: boolean;
    isPro: boolean;
    isPastDue: boolean;
    isExpired?: boolean;
    autoRenew: boolean;
    currentPeriodEnd: string | null;
    daysRemaining: number;
    cardsUsed: number;
    maxCards: number;
    payments: any[];
  };
  plans: PlanData[];
  userEmail: string;
  isSandboxMode?: boolean;
}

export default function SubscriptionClient({
  initialData,
  plans,
  userEmail,
  isSandboxMode = false,
}: SubscriptionClientProps) {
  const [data, setData] = useState(initialData);
  const [billingPeriod, setBillingPeriod] = useState<'MONTH' | 'YEAR'>('MONTH');
  const [togglingAutoRenew, setTogglingAutoRenew] = useState(false);

  // Modal checkout state
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [acceptOffer, setAcceptOffer] = useState(false);
  const [consentAutoRenew, setConsentAutoRenew] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleToggleAutoRenew = async () => {
    setTogglingAutoRenew(true);
    try {
      const res = await fetch('/api/subscription/toggle-autorenew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoRenew: !data.autoRenew }),
      });

      const resData = await res.json();
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          autoRenew: resData.autoRenew,
          subscription: prev.subscription
            ? { ...prev.subscription, autoRenew: resData.autoRenew, status: resData.status }
            : null,
        }));
      }
    } catch (err) {
      console.error('Failed to toggle autorenew:', err);
    } finally {
      setTogglingAutoRenew(false);
    }
  };

  const openCheckout = (plan: PlanData) => {
    setSelectedPlan(plan);
    setAcceptOffer(false);
    setConsentAutoRenew(false);
    setPaymentError(null);
    setModalOpen(true);
  };

  const handleInitiatePayment = async (simulateImmediate = false) => {
    if (!selectedPlan) return;
    if (!acceptOffer) {
      setPaymentError('Для продолжения необходимо подтвердить согласие с условиями оферты');
      return;
    }

    setPaymentError(null);
    setSubmittingPayment(true);

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planCode: selectedPlan.code,
          period: billingPeriod,
          autoRenew: consentAutoRenew,
          acceptOffer,
          simulateImmediate,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setPaymentError(resData.error || 'Ошибка при создании платежа');
        setSubmittingPayment(false);
        return;
      }

      if (simulateImmediate && resData.simulated) {
        // Refresh page data
        window.location.href = '/dashboard/subscription?status=success';
        return;
      }

      if (resData.confirmationUrl) {
        window.location.href = resData.confirmationUrl;
      }
    } catch {
      setPaymentError('Сетевая ошибка при связи с платёжным шлюзом');
      setSubmittingPayment(false);
    }
  };

  const formattedEndDate = data.currentPeriodEnd
    ? new Date(data.currentPeriodEnd).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="w-full min-w-0 max-w-full space-y-10">
      {/* Top Header */}
      <div className="w-full min-w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-amber-500" />
            <span>Подписка и тарифы</span>
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Управление тарифным планом, онлайн-оплата через ЮKassa (54-ФЗ) и чеки
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/legal/offer"
            target="_blank"
            className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Публичная оферта</span>
          </Link>
        </div>
      </div>

      {/* Current Subscription Status Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Текущий статус
              </span>
              {data.isTrial ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Пробный период (7 дней)
                </span>
              ) : data.isActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {data.isPro ? 'Тариф Pro (Активен)' : 'Тариф Обычный (Активен)'}
                </span>
              ) : data.isPastDue ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Льготный период (14 дней)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  Подписка не активна
                </span>
              )}
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white">
              {data.plan?.name || 'Тариф Обычный'}
            </div>

            {formattedEndDate && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {data.isTrial ? 'Пробный доступ до:' : 'Оплачено до:'}{' '}
                <strong className="text-slate-200">{formattedEndDate}</strong>
                {data.daysRemaining > 0 && (
                  <span className="text-slate-500">({data.daysRemaining} дн. осталось)</span>
                )}
              </p>
            )}
          </div>

          {/* Auto-renew switch & usage */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-stone-800">
            {data.isActive && (
              <div className="flex items-center gap-3 bg-stone-900/80 p-2.5 rounded-2xl border border-stone-800">
                <div className="text-right">
                  <div className="text-xs font-medium text-white">Автопродление</div>
                  <div className="text-[10px] text-stone-400">
                    {data.autoRenew ? 'Включено (списание в срок)' : 'Отключено'}
                  </div>
                </div>

                <button
                  onClick={handleToggleAutoRenew}
                  disabled={togglingAutoRenew}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none ${
                    data.autoRenew ? 'bg-amber-600' : 'bg-stone-700'
                  }`}
                  title="Переключить автопродление"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      data.autoRenew ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            <div className="text-xs text-stone-400">
              Лимит визиток:{' '}
              <strong className="text-white">
                {data.cardsUsed} из {data.maxCards}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector Switcher */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-2">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Выберите подходящий тариф</h2>
          <p className="text-xs text-slate-400 mt-1">
            Оплата российской картой через ЮKassa с фискальным чеком (54-ФЗ)
          </p>
        </div>

        <div className="inline-flex items-center p-1 rounded-2xl bg-stone-900 border border-stone-800">
          <button
            onClick={() => setBillingPeriod('MONTH')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
              billingPeriod === 'MONTH'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Ежемесячно
          </button>
          <button
            onClick={() => setBillingPeriod('YEAR')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              billingPeriod === 'YEAR'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>На 1 год</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isPro = plan.code === 'PRO';
          const price = billingPeriod === 'YEAR' ? plan.priceYear : plan.priceMonth;
          const monthlyEquivalent =
            billingPeriod === 'YEAR' ? Math.round(plan.priceYear / 12) : plan.priceMonth;

          const isCurrentActive =
            data.isActive && data.plan?.code === plan.code;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-8 relative flex flex-col justify-between transition-all duration-300 ${
                isPro
                  ? 'glass-panel border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10'
                  : 'glass-card border border-stone-800'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 w-max max-w-[90%]">
                  <span className="px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/30 whitespace-nowrap inline-flex items-center gap-1.5 border border-amber-400/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                    <span>Для бизнеса и команд</span>
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-stone-400 mt-1 min-h-[32px]">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1.5 pb-6 border-b border-stone-800/80">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {monthlyEquivalent} ₽
                  </span>
                  <span className="text-xs text-stone-400">/ месяц</span>
                  {billingPeriod === 'YEAR' && (
                    <span className="text-[11px] text-stone-500 ml-2">
                      ({price} ₽/год)
                    </span>
                  )}
                </div>

                {/* Features list */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Что входит:
                  </div>

                  <ul className="space-y-2.5 text-xs text-stone-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Визиток:{' '}
                        <strong className="text-white">
                          до {plan.maxCards} {plan.maxCards === 1 ? 'штуки' : 'штук'}
                        </strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Запись на NFC-наклейки и стикеры</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Генерация QR-кода (PNG и SVG)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Экспорт контактов в vCard 3.0</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Статистика просмотров, NFC-переходов и кликов</span>
                    </li>

                    {isPro ? (
                      <>
                        <li className="flex items-center gap-2.5 text-amber-300 font-medium">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Собственный короткий адрес визитки (/c/my-name)</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-amber-300 font-medium">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Единый корпоративный брендинг и стиль</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-amber-300 font-medium">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Управление сотрудниками компании и аудит</span>
                        </li>
                      </>
                    ) : (
                      <li className="flex items-center gap-2.5 text-stone-500">
                        <X className="w-4 h-4 shrink-0 text-stone-600" />
                        <span>Компании и корпоративный брендинг (в Pro)</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                {isCurrentActive ? (
                  <div className="w-full py-3 rounded-xl bg-stone-850 border border-stone-750 text-stone-200 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Ваш текущий тариф</span>
                  </div>
                ) : (
                  <button
                    onClick={() => openCheckout(plan)}
                    className={`w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider transition shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 ${
                      isPro
                        ? 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-amber-600/25'
                        : 'bg-stone-800 hover:bg-stone-750 text-white border border-stone-700'
                    }`}
                  >
                    <span>Выбрать {plan.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment History Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-400" />
            <span>История платежей и фискальные чеки (54-ФЗ)</span>
          </h3>
        </div>

        {data.payments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            История операций пока пуста
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Дата</th>
                  <th className="pb-3 font-semibold">Назначение</th>
                  <th className="pb-3 font-semibold">Сумма</th>
                  <th className="pb-3 font-semibold">Статус</th>
                  <th className="pb-3 font-semibold text-right">Электронный чек</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data.payments.map((p) => {
                  const dateStr = new Date(p.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 font-mono text-slate-400">{dateStr}</td>
                      <td className="py-3.5 font-medium text-white">
                        Подписка CardHub ({p.provider})
                      </td>
                      <td className="py-3.5 font-semibold text-white">{p.amount} ₽</td>
                      <td className="py-3.5">
                        {p.status === 'SUCCEEDED' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md text-[11px] font-medium border border-emerald-500/20">
                            <Check className="w-3 h-3" /> Оплачен
                          </span>
                        ) : p.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md text-[11px] font-medium border border-amber-500/20">
                            В обработке
                          </span>
                        ) : (
                          <span className="text-slate-500">Отменён</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        {p.receiptUrl ? (
                          <a
                            href={p.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
                          >
                            <span>Чек 54-ФЗ</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {modalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-8 border border-slate-700 shadow-2xl relative space-y-5 sm:space-y-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Оформление подписки
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Тариф {selectedPlan.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Период:{' '}
                <strong className="text-slate-200">
                  {billingPeriod === 'YEAR' ? '1 год' : '1 месяц'}
                </strong>
              </p>
            </div>

            {/* Total calculation */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Итого к оплате:</div>
                <div className="text-2xl font-black text-white">
                  {billingPeriod === 'YEAR'
                    ? selectedPlan.priceYear
                    : selectedPlan.priceMonth}{' '}
                  ₽
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                <div>Провайдер: <strong>ЮKassa</strong></div>
                <div className="text-emerald-400">Фискализация 54-ФЗ</div>
              </div>
            </div>

            {/* 54-FZ Notice */}
            <div className="text-[11px] text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              Электронный кассовый чек будет направлен на почту{' '}
              <strong className="text-slate-200">{userEmail}</strong> сразу после подтверждения
              оплаты в соответствии с требованиями Федерального закона № 54-ФЗ.
            </div>

            {/* Consents & Checkboxes (152-FZ & Offer) */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={acceptOffer}
                  onChange={(e) => setAcceptOffer(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>
                  Я прочитал(-а) и безоговорочно принимаю условия{' '}
                  <Link
                    href="/legal/offer"
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    Публичной оферты
                  </Link>{' '}
                  и правила предоставления сервиса CardHub.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={consentAutoRenew}
                  onChange={(e) => setConsentAutoRenew(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>
                  Согласен(-на) на периодическое автоматическое продление подписки (автосписание).
                  Автопродление можно отключить в любой момент в личном кабинете в 1 клик.
                </span>
              </label>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleInitiatePayment(false)}
                disabled={submittingPayment}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submittingPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Перейти к оплате через ЮKassa</span>
                  </>
                )}
              </button>

              {isSandboxMode && (
                <button
                  onClick={() => handleInitiatePayment(true)}
                  disabled={submittingPayment}
                  className="w-full py-2.5 rounded-xl font-medium text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-center gap-2"
                  title="Эмуляция успешной оплаты для проверки в dev-окружении без ввода карты"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Оплатить в тестовом режиме (Sandbox Эмуляция)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
