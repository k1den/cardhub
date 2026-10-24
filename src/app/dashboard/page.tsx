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
  Edit2,
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
      company: true,
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
    <div className="w-full min-w-0 max-w-full space-y-8 font-sans">
      {/* Top Banner / Welcome */}
      <div className="w-full min-w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
            Личный кабинет
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Управляйте вашей электронной визиткой, стикерами NFC и аналитикой
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <Link
            href="/dashboard/cards/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/25 text-sm active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Создать визитку</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-3xl space-y-2 border border-stone-200 dark:border-stone-800 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 text-xs font-medium">
            <span>Просмотры визитки</span>
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">{totalViews}</div>
          <div className="text-[11px] text-stone-500">За последние 30 дней</div>
        </div>

        <div className="glass-card p-5 rounded-3xl space-y-2 border border-stone-200 dark:border-stone-800 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 text-xs font-medium">
            <span>Переходы по NFC-меткам</span>
            <Radio className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">{totalNfc}</div>
          <div className="text-[11px] text-stone-500">Касания стикера смартфоном</div>
        </div>

        <div className="glass-card p-5 rounded-3xl space-y-2 border border-stone-200 dark:border-stone-800 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 text-xs font-medium">
            <span>Сохранений контакта (vCard)</span>
            <Download className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalVCard}</div>
          <div className="text-[11px] text-stone-500">Добавлено в телефонную книгу</div>
        </div>
      </div>

      {/* Trial Notification Banner */}
      {subStatus.isTrial && (
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-stone-900 to-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Пробный период активен</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Осталось {subStatus.daysRemaining} дн.
                </span>
              </div>
              <div className="text-xs text-stone-300 mt-0.5">
                Вам доступно бесплатное создание визитки, запись на NFC и QR-код. Оформите подписку, чтобы сохранить работу визитки.
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-md shadow-amber-600/25 shrink-0"
          >
            <span>Тарифы и оплата</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Expired Subscription Banner */}
      {!subStatus.isActive && !subStatus.isPro && (
        <div className="glass-panel p-5 rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-stone-900 to-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Пробный период завершился</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Требуется оплата
                </span>
              </div>
              <div className="text-xs text-stone-300 mt-0.5">
                Создание и редактирование визиток временно приостановлено. Оформите подписку (290 ₽/мес) для продолжения работы.
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition shadow-md shadow-rose-600/25 shrink-0"
          >
            <span>Оформить подписку</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Cards List or Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <span>Мои электронные визитки ({cards.length})</span>
          </h2>
        </div>

        {cards.length === 0 ? (
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-stone-200 dark:border-stone-800 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">У вас пока нет созданных визиток</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Создайте вашу персональную страницу со стильным оформлением, контактами, мессенджерами и услугами.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/cards/new"
                className="inline-flex items-center gap-2 py-3.5 px-7 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/30 text-sm"
              >
                Создать первую визитку <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const theme = (card.themeConfig as any) || {};
              const primaryColor = theme.primaryColor || '#d97706';
              const cardViews = card.events.reduce((acc, ev) => acc + ev.viewsCount, 0);

              return (
                <div
                  key={card.id}
                  className="glass-card p-6 rounded-3xl space-y-4 border border-stone-200 dark:border-stone-800 flex flex-col justify-between hover:border-amber-500/40 transition shadow-sm dark:shadow-none"
                >
                  <div className="space-y-3">
                    {/* Header with Avatar & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-white text-base shadow shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {card.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={card.avatarUrl}
                              alt={card.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {card.fullName
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((s) => s[0]?.toUpperCase())
                                .join('') || 'CH'}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-stone-900 dark:text-white text-base leading-snug">
                            {card.fullName}
                          </h4>
                          <p className="text-xs text-stone-600 dark:text-stone-400 truncate max-w-[150px]">
                            {card.position || card.companyName || 'Без должности'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          card.published
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-transparent'
                        }`}
                      >
                        {card.published ? 'Активна' : 'Черновик'}
                      </span>
                    </div>

                    {/* Short Link */}
                    <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono text-stone-700 dark:text-stone-300 flex items-center justify-between">
                      <span className="truncate">/c/{card.slug}</span>
                      <Link
                        href={`/c/${card.slug}`}
                        target="_blank"
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-500 ml-2"
                        title="Открыть визитку в новой вкладке"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Stats pill */}
                    <div className="flex items-center gap-3 text-[11px] text-stone-600 dark:text-stone-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>{cardViews} просм.</span>
                      </span>
                      <span>•</span>
                      <span>{card.fields.length} контактов</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-800/80 flex items-center gap-2">
                    <Link
                      href={`/dashboard/cards/${card.id}/edit`}
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-900 dark:text-white border border-stone-300 dark:border-transparent text-xs font-semibold transition"
                    >
                      Редактировать
                    </Link>
                    <Link
                      href={`/dashboard/cards/${card.id}/nfc`}
                      className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      title="Записать на NFC"
                    >
                      <Radio className="w-3.5 h-3.5" /> NFC
                    </Link>
                    <Link
                      href={`/dashboard/cards/${card.id}/stats`}
                      className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-transparent text-xs font-medium transition flex items-center gap-1"
                      title="Статистика"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
