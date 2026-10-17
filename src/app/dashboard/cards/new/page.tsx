import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import CardEditorForm from '@/components/card/CardEditorForm';

import { paymentService } from '@/lib/payments/service';

export default async function NewCardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Check card creation allowance (including 7-day trial and plan limits)
  const planCheck = await paymentService.checkCardCreationAllowed(session.user.id);
  if (!planCheck.allowed && session.user.role !== 'ADMIN') {
    if (planCheck.maxCards === 0) {
      redirect('/dashboard/subscription?error=trial_expired');
    }
    redirect('/dashboard?error=plan_limit_reached');
  }

  const isPro = session.user.role === 'PRO' || session.user.role === 'ADMIN';

  return <CardEditorForm isProUser={isPro} />;
}
