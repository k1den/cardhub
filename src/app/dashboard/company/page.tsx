import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { companyService } from '@/lib/company/service';
import { paymentService } from '@/lib/payments/service';
import CompanyDashboardClient from '@/components/company/CompanyDashboardClient';

export default async function CompanyDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const companyData = await companyService.getCompanyForUser(session.user.id);
  const subStatus = await paymentService.getUserSubscription(session.user.id);

  const serializedCompany = companyData?.company
    ? {
        ...companyData.company,
        createdAt: companyData.company.createdAt.toISOString(),
        updatedAt: companyData.company.updatedAt.toISOString(),
        deletedAt: companyData.company.deletedAt?.toISOString() || null,
        memberships: companyData.company.memberships.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        })),
        cards: companyData.company.cards.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          deletedAt: c.deletedAt?.toISOString() || null,
        })),
        invitations: companyData.company.invitations.map((i) => ({
          ...i,
          expiresAt: i.expiresAt.toISOString(),
          createdAt: i.createdAt.toISOString(),
        })),
      }
    : null;

  return (
    <CompanyDashboardClient
      initialCompany={serializedCompany as any}
      isOwner={companyData?.isOwner || false}
      isMember={Boolean(companyData && !companyData.isOwner)}
      isPro={subStatus.isPro || session.user.role === 'ADMIN'}
      userId={session.user.id}
    />
  );
}
