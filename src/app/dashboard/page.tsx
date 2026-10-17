import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
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

        <div>
          <Link
            href="/dashboard/cards/new"
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/25 text-sm"
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
          <div className="text-2xl font-black text-white">0</div>
          <div className="text-[11px] text-slate-500">За последние 30 дней</div>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Переходы с NFC-меток</span>
            <Radio className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">0</div>
          <div className="text-[11px] text-slate-500">Касания стикера телефоном</div>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Сохранений контакта (vCard)</span>
            <Download className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">0</div>
          <div className="text-[11px] text-slate-500">Добавлено в телефонную книгу</div>
        </div>
      </div>

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
                    className="py-2 px-3 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-medium transition flex items-center gap-1"
                  >
                    <Radio className="w-3.5 h-3.5" /> NFC
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
