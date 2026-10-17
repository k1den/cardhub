import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PublicCardClient from '@/components/card/PublicCardClient';
import { EventSource } from '@prisma/client';
import { Lock, Radio } from 'lucide-react';
import Link from 'next/link';

interface PublicCardPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ s?: string }>;
}

export async function generateMetadata({ params }: PublicCardPageProps): Promise<Metadata> {
  const { slug } = await params;

  const card = await prisma.card.findFirst({
    where: { slug, deletedAt: null },
    select: {
      fullName: true,
      position: true,
      companyName: true,
      bio: true,
      avatarUrl: true,
      isIndexed: true,
    },
  });

  if (!card) {
    return { title: 'Визитка не найдена' };
  }

  const title = `${card.fullName} — Цифровая визитка`;
  const description =
    [card.position, card.companyName].filter(Boolean).join(' • ') ||
    card.bio ||
    'Электронная визитка CardHub';

  return {
    title,
    description,
    robots: card.isIndexed
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: 'profile',
      locale: 'ru_RU',
      images: card.avatarUrl ? [{ url: card.avatarUrl }] : [],
    },
  };
}

export default async function PublicCardPage({ params, searchParams }: PublicCardPageProps) {
  const { slug } = await params;
  const { s } = await searchParams;

  const card = await prisma.card.findFirst({
    where: {
      slug,
      deletedAt: null,
    },
    include: {
      fields: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!card) {
    notFound();
  }

  // Record daily analytics event
  try {
    const rawSource = (s || '').toUpperCase();
    const source: EventSource =
      rawSource === 'NFC'
        ? EventSource.NFC
        : rawSource === 'QR'
        ? EventSource.QR
        : EventSource.DIRECT;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.cardEvent.upsert({
      where: {
        cardId_date_source: {
          cardId: card.id,
          date: today,
          source,
        },
      },
      update: {
        viewsCount: { increment: 1 },
      },
      create: {
        cardId: card.id,
        date: today,
        source,
        viewsCount: 1,
      },
    });
  } catch (err) {
    console.error('Failed to record card event view:', err);
  }

  // If card is unpublished, show compliant placeholder (TZ section 3)
  if (!card.published) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 max-w-md w-full space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Визитка временно недоступна</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Владелец визитки временно приостановил её публикацию или обновляет контактные данные.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              Перейти на главную CardHub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cardUrl = `${appUrl}/c/${card.slug}`;

  const renderData = {
    id: card.id,
    slug: card.slug,
    fullName: card.fullName,
    position: card.position,
    companyName: card.companyName,
    bio: card.bio,
    avatarUrl: card.avatarUrl,
    coverUrl: card.coverUrl,
    templateId: card.templateId as any,
    themeConfig: card.themeConfig as any,
    fields: card.fields.map((f) => ({
      id: f.id,
      type: f.type,
      label: f.label,
      value: f.value,
      visible: f.visible,
      sortOrder: f.sortOrder,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient lights */}
      <div className="ambient-glow bg-blue-600/20 w-96 h-96 -top-20 -left-20" />
      <div className="ambient-glow bg-indigo-600/20 w-96 h-96 -bottom-20 -right-20" />

      <main className="relative z-10 w-full flex items-center justify-center my-auto">
        <PublicCardClient card={renderData} cardUrl={cardUrl} />
      </main>

      <footer className="relative z-10 text-center text-xs text-slate-500 py-4 mt-6">
        <Link href="/" className="hover:text-slate-400 transition inline-flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-[9px] font-black">
            CH
          </span>
          <span>Создайте свою визитку на CardHub</span>
        </Link>
      </footer>
    </div>
  );
}
