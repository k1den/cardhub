import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import WebNfcWriter from '@/components/nfc/WebNfcWriter';
import { ArrowLeft, ExternalLink, Radio } from 'lucide-react';

interface NfcPageProps {
  params: Promise<{ id: string }>;
}

export default async function CardNfcPage({ params }: NfcPageProps) {
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

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      {/* Top Header Bar */}
      <div className="w-full min-w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:border-amber-500/50 transition shadow-sm"
            title="Назад к визиткам"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-orange-500/10 text-orange-500">
                <Radio className="w-5 h-5" />
              </span>
              <span>Запись на NFC-метку</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Визитка: <strong className="text-stone-800 dark:text-stone-200">{card.fullName}</strong>
            </p>
          </div>
        </div>

        <Link
          href={`/c/${card.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:border-amber-500/50 transition shadow-sm"
        >
          <span>Открыть визитку</span>
          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
        </Link>
      </div>

      <WebNfcWriter slug={card.slug} cardTitle={card.fullName} />
    </div>
  );
}
