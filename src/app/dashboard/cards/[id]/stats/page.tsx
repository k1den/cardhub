import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { EventSource } from '@prisma/client';
import {
  BarChart3,
  Eye,
  Radio,
  QrCode,
  Download,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  MousePointerClick,
  Sparkles,
  Layers,
} from 'lucide-react';

interface StatsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CardStatsPage({ params }: StatsPageProps) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;

  const card = await prisma.card.findFirst({
    where: {
      id,
      ownerId: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
      slug: true,
      fullName: true,
      position: true,
      companyName: true,
    },
  });

  if (!card) {
    notFound();
  }

  // Fetch last 30 days events
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  startDate.setUTCHours(0, 0, 0, 0);

  const events = await prisma.cardEvent.findMany({
    where: {
      cardId: card.id,
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
  });

  // Calculate totals
  let totalViews = 0;
  let nfcViews = 0;
  let qrViews = 0;
  let directViews = 0;
  let totalVCardDownloads = 0;
  let totalClicks = 0;

  // Daily map for the last 14 days
  const dailyMap = new Map<
    string,
    { date: string; label: string; views: number; nfc: number; qr: number; direct: number; vcard: number; clicks: number }
  >();

  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
    dailyMap.set(dateStr, { date: dateStr, label, views: 0, nfc: 0, qr: 0, direct: 0, vcard: 0, clicks: 0 });
  }

  events.forEach((ev) => {
    totalViews += ev.viewsCount;
    totalVCardDownloads += ev.vcardDownloads;
    totalClicks += ev.clicksCount;

    if (ev.source === EventSource.NFC) nfcViews += ev.viewsCount;
    else if (ev.source === EventSource.QR) qrViews += ev.viewsCount;
    else directViews += ev.viewsCount;

    const dateStr = ev.date.toISOString().split('T')[0];
    const entry = dailyMap.get(dateStr);
    if (entry) {
      entry.views += ev.viewsCount;
      entry.vcard += ev.vcardDownloads;
      entry.clicks += ev.clicksCount;
      if (ev.source === EventSource.NFC) entry.nfc += ev.viewsCount;
      else if (ev.source === EventSource.QR) entry.qr += ev.viewsCount;
      else entry.direct += ev.viewsCount;
    }
  });

  const dailyData = Array.from(dailyMap.values());
  const maxDayViews = Math.max(...dailyData.map((d) => d.views), 5);

  const nfcPercent = totalViews > 0 ? Math.round((nfcViews / totalViews) * 100) : 0;
  const qrPercent = totalViews > 0 ? Math.round((qrViews / totalViews) * 100) : 0;
  const directPercent = totalViews > 0 ? Math.max(0, 100 - nfcPercent - qrPercent) : 0;

  return (
    <div className="w-full min-w-0 max-w-full space-y-8 relative">
      {/* Top Header */}
      <div className="w-full min-w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3.5">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white hover:border-amber-500/40 shadow-xs transition shrink-0"
            title="Назад к визиткам"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-amber-500" />
              <span>Статистика визитки</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-stone-500 dark:text-stone-400">
              <span>Визитка:</span>
              <strong className="text-stone-900 dark:text-white font-semibold">{card.fullName}</strong>
              {card.companyName && (
                <>
                  <span className="text-stone-300 dark:text-stone-700">•</span>
                  <span>{card.companyName}</span>
                </>
              )}
              <Link
                href={`/c/${card.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-medium ml-1"
              >
                <span>/c/{card.slug}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/dashboard/cards/${card.id}/nfc`}
            className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition flex items-center gap-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-500/40 px-3.5 py-2 rounded-xl shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            <span>Запись NFC</span>
          </Link>

          <span className="text-[11px] font-semibold px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Последние 30 дней</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Views */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Всего просмотров
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
            {totalViews}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">За последние 30 дней</div>
        </div>

        {/* NFC Touches */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 shadow-sm hover:shadow-md hover:border-orange-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Переходы с NFC
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
            {nfcViews}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            {totalViews > 0 ? `${nfcPercent}% от общего числа` : 'Касания NFC-чипа'}
          </div>
        </div>

        {/* QR Scans */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 shadow-sm hover:shadow-md hover:border-rose-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Сканирования QR
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {qrViews}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            {totalViews > 0 ? `${qrPercent}% от общего числа` : 'Камерой телефона'}
          </div>
        </div>

        {/* Contact Clicks */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Клики по кнопкам
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {totalClicks}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            {totalViews > 0 ? `CTR: ${Math.round((totalClicks / totalViews) * 100)}%` : 'Телефоны, соцсети'}
          </div>
        </div>

        {/* vCard Downloads */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all space-y-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Сохранения vCard
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {totalVCardDownloads}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">В контакты смартфона</div>
        </div>
      </div>

      {/* Sources Distribution Breakdown Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-900 dark:text-white">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Распределение источников переходов</span>
          </span>
          <span className="text-stone-500 dark:text-stone-400 text-[11px]">
            Всего: {totalViews} переходов
          </span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex">
          <div
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${totalViews > 0 ? nfcPercent : 33.3}%` }}
            title={`NFC: ${nfcViews} (${nfcPercent}%)`}
          />
          <div
            className="h-full bg-rose-500 transition-all"
            style={{ width: `${totalViews > 0 ? qrPercent : 33.3}%` }}
            title={`QR: ${qrViews} (${qrPercent}%)`}
          />
          <div
            className="h-full bg-amber-500 transition-all"
            style={{ width: `${totalViews > 0 ? directPercent : 33.4}%` }}
            title={`Прямой переход: ${directViews} (${directPercent}%)`}
          />
        </div>

        {/* Legend / Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="text-[10px] text-orange-700 dark:text-orange-400 font-medium">NFC-метки</div>
            <div className="text-sm font-bold text-stone-900 dark:text-white">{nfcViews} <span className="text-xs text-stone-500">({nfcPercent}%)</span></div>
          </div>
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="text-[10px] text-rose-700 dark:text-rose-400 font-medium">QR-коды</div>
            <div className="text-sm font-bold text-stone-900 dark:text-white">{qrViews} <span className="text-xs text-stone-500">({qrPercent}%)</span></div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Прямые ссылки</div>
            <div className="text-sm font-bold text-stone-900 dark:text-white">{directViews} <span className="text-xs text-stone-500">({directPercent}%)</span></div>
          </div>
        </div>
      </div>

      {/* Daily Dynamics Visual Chart */}
      <div className="glass-panel p-6 sm:p-8 rounded-[32px] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 shadow-xl dark:shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span>Динамика просмотров по дням (последние 14 дней)</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Подсчёт ведётся на защищенном сервере в реальном времени
            </p>
          </div>
        </div>

        {/* Bar Chart Representation */}
        <div className="overflow-x-auto no-scrollbar pt-6 pb-2">
          <div className="min-w-[440px] sm:min-w-0 h-56 flex items-end justify-between gap-1.5 sm:gap-2.5 px-2">
            {dailyData.map((d) => {
              const heightPercent = Math.max((d.views / maxDayViews) * 100, 5);

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition duration-150 absolute bottom-full mb-2 z-20 text-[11px] bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-750 px-3 py-2 rounded-2xl shadow-xl text-stone-900 dark:text-stone-100 pointer-events-none whitespace-nowrap min-w-[120px]">
                    <div className="font-bold border-b border-stone-100 dark:border-stone-800 pb-1 mb-1">
                      {d.label}: {d.views} просм.
                    </div>
                    {d.nfc > 0 && <div className="text-orange-600 dark:text-orange-400">NFC: {d.nfc}</div>}
                    {d.qr > 0 && <div className="text-rose-600 dark:text-rose-400">QR: {d.qr}</div>}
                    {d.clicks > 0 && <div className="text-amber-600 dark:text-amber-400">Клики: {d.clicks}</div>}
                    {d.vcard > 0 && <div className="text-emerald-600 dark:text-emerald-400">vCard: {d.vcard}</div>}
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full max-w-[28px] rounded-t-xl bg-gradient-to-t from-amber-600 via-orange-500 to-amber-400 group-hover:from-amber-500 group-hover:to-orange-400 transition-all shadow-sm group-hover:shadow-md group-hover:shadow-amber-500/25"
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Date Label */}
                  <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-5 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
            <span className="font-medium text-stone-800 dark:text-stone-200">Все просмотры</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-xs" />
            <span>NFC-стикеры (?s=nfc)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
            <span>QR-код (?s=qr)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
            <span>Сохранения vCard</span>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Box (152-ФЗ / 242-ФЗ) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex items-start gap-3.5 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-stone-900 dark:text-white font-bold block">
            100% приватная серверная аналитика (152-ФЗ и 242-ФЗ):
          </strong>
          <p className="text-[11px] leading-relaxed">
            CardHub не использует сторонние трекеры (Google Analytics, Яндекс.Метрику без согласия) и не устанавливает отслеживающие cookie в браузеры ваших собеседников. IP-адреса посетителей не сохраняются в базе данных — все счётчики анонимизированы и суммируются непосредственно на наших защищенных серверах в РФ.
          </p>
        </div>
      </div>
    </div>
  );
}
