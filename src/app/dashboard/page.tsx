import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { paymentService } from '@/lib/payments/service';
import {
  CreditCard,
  Plus,
  Radio,
  QrCode,
  ExternalLink,
  Eye,
  MousePointerClick,
  Download,
  Sparkles,
  ArrowRight,
  Shield,
  BarChart3,
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Fetch cards belonging to this user
  const cards = await prisma.card.findMany({
    where: {
      ownerId: session.user.id,
      deletedAt: null,
    },
    include: {
      fields: true,
      events: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate real metrics across all user cards
  let totalViews = 0;
  let totalNfc = 0;
  let totalVCard = 0;

  // Fetch user subscription status
  const subStatus = await paymentService.getUserSubscription(session.user.id);

  cards.forEach((c) => {
    c.events.forEach((ev) => {
      totalViews += ev.viewsCount;
      totalVCard += ev.vcardDownloads;
      if (ev.source === 'NFC') totalNfc += ev.viewsCount;
    });
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Личный кабинет
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Управляйте вашей цифровой визиткой, NFC-метками и аналитикой
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <Link
            href="/dashboard/cards/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/25 text-sm active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Создать визитку</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Просмотры визитки</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalViews}</div>
          <div className="text-[11px] text-slate-500">За последние 30 дней</div>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Переходы с NFC-меток</span>
            <Radio className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400">{totalNfc}</div>
          <div className="text-[11px] text-slate-500">Касания стикера телефоном</div>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Сохранений контакта (vCard)</span>
            <Download className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalVCard}</div>
          <div className="text-[11px] text-slate-500">Добавлено в телефонную книгу</div>
        </div>
      </div>

      {/* Trial Notification Banner */}
      {subStatus.isTrial && (
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Пробный период активен</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Осталось {subStatus.daysRemaining} дн.
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Вам доступно бесплатное создание 1 визитки, запись на NFC и QR-код. Оформите подписку, чтобы сохранить работу визитки.
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md shadow-blue-600/25 shrink-0"
          >
            <span>Тарифы и оплата</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Expired Subscription Banner */}
      {!subStatus.isActive && !subStatus.isPro && (
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Пробный период завершился</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Требуется оплата
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Создание и редактирование визиток временно заблокировано. Оформите подписку (290 ₽/мес) для продолжения использования.
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition shadow-md shadow-rose-600/25 shrink-0"
          >
            <span>Оформить подписку</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Pro Callout Banner if not Pro and not expired */}
      {subStatus.isActive && !subStatus.isPro && (
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Перейдите на тариф Pro для расширенных возможностей
              </div>
              <div className="text-xs text-slate-300">
                До 10 визиток сотрудников, единый брендинг компании, красивый персональный адрес и подробный аудит.
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20 shrink-0"
          >
            <span>Тарифы и оплата</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Cards List or Empty State */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <span>Мои визитки</span>
        </h2>

        {cards.length === 0 ? (
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold text-white">У вас пока нет созданных визиток</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Создайте вашу первую персональную страницу с контактами, ссылками на соцсети и мессенджеры для записи на NFC-стикер или передачи по QR-коду.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/cards/new"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 text-sm"
              >
                Создать визитку прямо сейчас <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div key={card.id} className="glass-card p-6 rounded-2xl space-y-4 border border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{card.fullName}</h4>
                    <p className="text-xs text-blue-400">{card.position || 'Должность не указана'}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      card.published
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {card.published ? 'Опубликована' : 'Черновик'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span className="truncate">/c/{card.slug}</span>
                  <Link
                    href={`/c/${card.slug}`}
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 ml-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href={`/dashboard/cards/${card.id}/edit`}
                    className="flex-1 text-center py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
                  >
                    Редактировать
                  </Link>
                  <Link
                    href={`/dashboard/cards/${card.id}/nfc`}
                    className="py-2 px-3 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-medium transition flex items-center gap-1"
                    title="Записать на NFC"
                  >
                    <Radio className="w-3.5 h-3.5" /> NFC
                  </Link>
                  <Link
                    href={`/dashboard/cards/${card.id}/stats`}
                    className="py-2 px-3 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-medium transition flex items-center gap-1"
                    title="Статистика"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
