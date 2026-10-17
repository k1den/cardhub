import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import WebNfcWriter from '@/components/nfc/WebNfcWriter';
import { ArrowLeft, ExternalLink } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Запись на NFC-метку
            </h1>
            <p className="text-xs text-slate-400">
              Визитка: <strong className="text-slate-200">{card.fullName}</strong>
            </p>
          </div>
        </div>

        <Link
          href={`/c/${card.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-300 hover:text-white transition"
        >
          <span>Открыть визитку</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <WebNfcWriter slug={card.slug} cardTitle={card.fullName} />
    </div>
  );
}
