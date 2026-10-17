import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Консоль администратора | CardHub',
  description: 'Панель управления платформой, модерация жалоб по 149-ФЗ и аудит безопасности',
};

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login?redirect=/admin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <Suspense
      fallback={
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <AdminDashboardClient currentUserId={session.user.id} />
    </Suspense>
  );
}
