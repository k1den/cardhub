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
  Share2,
  MousePointerClick,
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
  const dailyMap = new Map<string, { date: string; label: string; views: number; nfc: number; qr: number; direct: number; vcard: number; clicks: number }>();

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

  return (
    <div className="w-full min-w-0 max-w-full space-y-8">
      {/* Top Header */}
      <div className="w-full min-w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span>Статистика визитки</span>
            </h1>
            <p className="text-xs text-slate-400">
              Визитка: <strong className="text-slate-200">{card.fullName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Последние 30 дней
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Views */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Всего просмотров</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalViews}</div>
          <div className="text-[11px] text-slate-500">За последние 30 дней</div>
        </div>

        {/* NFC Touches */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Переходы с NFC</span>
            <Radio className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400">{nfcViews}</div>
          <div className="text-[11px] text-slate-500">
            {totalViews > 0 ? `${Math.round((nfcViews / totalViews) * 100)}% от общего` : 'Касания стикера'}
          </div>
        </div>

        {/* QR Scans */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Сканирования QR</span>
            <QrCode className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400">{qrViews}</div>
          <div className="text-[11px] text-slate-500">
            {totalViews > 0 ? `${Math.round((qrViews / totalViews) * 100)}% от общего` : 'Камерой смартфона'}
          </div>
        </div>

        {/* Contact Clicks */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Клики по кнопкам</span>
            <MousePointerClick className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{totalClicks}</div>
          <div className="text-[11px] text-slate-500">
            {totalViews > 0 ? `CTR: ${Math.round((totalClicks / totalViews) * 100)}%` : 'Телефоны, мессенджеры'}
          </div>
        </div>

        {/* vCard Downloads */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Сохранения vCard</span>
            <Download className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{totalVCardDownloads}</div>
          <div className="text-[11px] text-slate-500">В телефонную книгу</div>
        </div>
      </div>

      {/* Daily Dynamics Visual Chart */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Динамика просмотров по дням (последние 14 дней)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Подсчёт ведётся на сервере в реальном времени
            </p>
          </div>
        </div>

        {/* Bar Chart Representation */}
        <div className="overflow-x-auto no-scrollbar pt-6 pb-2">
          <div className="min-w-[420px] sm:min-w-0 h-48 flex items-end justify-between gap-1 sm:gap-2">
            {dailyData.map((d) => {
              const heightPercent = Math.max((d.views / maxDayViews) * 100, 4);

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition text-[10px] bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow-lg text-slate-200 pointer-events-none whitespace-nowrap mb-1">
                    <div>{d.label}: <strong>{d.views}</strong> просм.</div>
                    {d.nfc > 0 && <div className="text-indigo-400">NFC: {d.nfc}</div>}
                    {d.qr > 0 && <div className="text-purple-400">QR: {d.qr}</div>}
                    {d.clicks > 0 && <div className="text-amber-400">Клики: {d.clicks}</div>}
                    {d.vcard > 0 && <div className="text-emerald-400">vCard: {d.vcard}</div>}
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition"
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Date Label */}
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-500" />
            <span>Все просмотры</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-indigo-500" />
            <span>NFC стикеры (?s=nfc)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-purple-500" />
            <span>QR-код (?s=qr)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Сохранения контакта (vCard)</span>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Box (152-ФЗ / 242-ФЗ) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-200">100% приватная серверная аналитика (152-ФЗ):</strong>
          <p className="text-[11px] leading-relaxed">
            CardHub не использует сторонние трекеры (Google Analytics, Яндекс.Метрику без согласия) и не устанавливает отслеживающие cookie в браузеры ваших собеседников. IP-адреса посетителей не сохраняются в базе данных — все счётчики анонимизированы и суммируются непосредственно на наших серверах в РФ.
          </p>
        </div>
      </div>
    </div>
  );
}
