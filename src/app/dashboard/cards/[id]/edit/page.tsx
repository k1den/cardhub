import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import CardEditorForm from '@/components/card/CardEditorForm';

interface EditCardPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCardPage({ params }: EditCardPageProps) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;

  const card = await prisma.card.findFirst({
    where: {
      id,
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

  // IDOR Protection: Owner, Company Owner, or Superadmin
  const isOwner = card.ownerId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    redirect('/dashboard?error=access_denied');
  }

  const isPro = session.user.role === 'PRO' || isAdmin;

  const cardData = {
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
    published: card.published,
    isIndexed: card.isIndexed,
    fields: card.fields.map((f) => ({
      id: f.id,
      type: f.type,
      label: f.label,
      value: f.value,
      visible: f.visible,
      sortOrder: f.sortOrder,
    })),
  };

  return <CardEditorForm initialCard={cardData} isProUser={isPro} />;
}
