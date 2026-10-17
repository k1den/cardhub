import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import CardEditorForm from '@/components/card/CardEditorForm';

export default async function NewCardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Check card count for Regular users
  const activeCards = await prisma.card.count({
    where: {
      ownerId: session.user.id,
      deletedAt: null,
    },
  });

  if (session.user.role === 'USER' && activeCards >= 1) {
    redirect('/dashboard?error=plan_limit_reached');
  }

  const isPro = session.user.role === 'PRO' || session.user.role === 'ADMIN';

  return <CardEditorForm isProUser={isPro} />;
}
