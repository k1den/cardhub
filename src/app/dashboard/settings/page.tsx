import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import UserSettingsClient from '@/components/dashboard/UserSettingsClient';

export const metadata = {
  title: 'Настройки профиля и безопасность | CardHub',
  description: 'Управление безопасностью, 2FA, экспорт и удаление данных по 152-ФЗ',
};

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      totpEnabled: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <UserSettingsClient
      user={{
        id: user.id,
        email: user.email,
        role: user.role,
        totpEnabled: user.totpEnabled,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
}
