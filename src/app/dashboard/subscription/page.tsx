import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { paymentService } from '@/lib/payments/service';
import SubscriptionClient from '@/components/subscription/SubscriptionClient';

export default async function SubscriptionPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const subData = await paymentService.getUserSubscription(session.user.id);

  const rawPlans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonth: 'asc' },
  });

  const serializedData = {
    ...subData,
    currentPeriodEnd: subData.currentPeriodEnd ? subData.currentPeriodEnd.toISOString() : null,
    subscription: subData.subscription
      ? {
          ...subData.subscription,
          currentPeriodStart: subData.subscription.currentPeriodStart.toISOString(),
          currentPeriodEnd: subData.subscription.currentPeriodEnd.toISOString(),
          gracePeriodEnd: subData.subscription.gracePeriodEnd
            ? subData.subscription.gracePeriodEnd.toISOString()
            : null,
          createdAt: subData.subscription.createdAt.toISOString(),
          updatedAt: subData.subscription.updatedAt.toISOString(),
        }
      : null,
    payments: subData.payments.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  };

  const serializedPlans = rawPlans.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    priceMonth: p.priceMonth,
    priceYear: p.priceYear,
    maxCards: p.maxCards,
    maxMembers: p.maxMembers,
    features: p.features,
  }));

  const isSandboxMode = !process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY;

  return (
    <SubscriptionClient
      initialData={serializedData}
      plans={serializedPlans}
      userEmail={session.user.email}
      isSandboxMode={isSandboxMode}
    />
  );
}
