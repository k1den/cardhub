import React from 'react';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { companyService } from '@/lib/company/service';
import InviteAcceptClient from '@/components/company/InviteAcceptClient';
import { AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  const result = await companyService.getInvitationByToken(token);

  if (!result || !result.invitation) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 max-w-md w-full space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Приглашение не найдено</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Ссылка приглашения недействительна или была аннулирована администратором компании.
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

  if (result.isExpired) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 max-w-md w-full space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Срок приглашения истёк</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Срок действия приглашения (7 дней) завершился. Пожалуйста, попросите администратора компании отправить вам новую ссылку.
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

  if (result.isAccepted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 max-w-md w-full space-y-4">
          <h1 className="text-xl font-bold text-white">Приглашение уже принято</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Это приглашение уже было успешно использовано для вступления в компанию.
          </p>
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition inline-block"
            >
              Перейти в личный кабинет
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const session = await getSession();

  return (
    <InviteAcceptClient
      token={token}
      company={result.invitation.company}
      email={result.invitation.email}
      isLoggedIn={Boolean(session)}
      currentUserEmail={session?.user.email}
    />
  );
}
