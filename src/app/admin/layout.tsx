import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import LogoutButton from '@/components/dashboard/LogoutButton';
import ThemeToggle from '@/components/ui/ThemeToggle';
import {
  ShieldAlert,
  Users,
  Flag,
  FileText,
  LayoutDashboard,
  BarChart2,
  Lock,
} from 'lucide-react';

export const metadata = {
  title: 'Панель администратора | CardHub',
  description: 'Управление платформой, модерация 149-ФЗ и аудит безопасности',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login?redirect=/admin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Admin Header */}
      <header className="border-b border-stone-200 dark:border-amber-500/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 py-3 sm:px-6 sm:py-3.5 shadow-sm dark:shadow-lg dark:shadow-black/40 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-white">CardHub</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Управление платформой</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5"
              >
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Обзор</span>
              </Link>
              <Link
                href="/admin?tab=reports"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5 text-red-400" />
                <span>Модерация 149-ФЗ</span>
              </Link>
              <Link
                href="/admin?tab=users"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Пользователи</span>
              </Link>
              <Link
                href="/admin?tab=audit"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Журнал аудита</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <ThemeToggle />

            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-stone-100 dark:bg-slate-800/50 hover:bg-stone-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700/60 transition flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Личный кабинет</span>
            </Link>

            <div className="h-6 w-px bg-stone-200 dark:bg-slate-800 hidden sm:block" />

            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{session.user.email}</div>
              <div className="text-[10px] text-amber-500 dark:text-amber-400 flex items-center justify-end gap-1">
                <Lock className="w-3 h-3" />
                Суперпользователь
              </div>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>CardHub Administration Console • OWASP ASVS L2 / 152-ФЗ / 149-ФЗ Compliant</span>
          <span className="text-[11px] text-slate-500 font-mono">
            IP Access Logged • Internal Admin Route
          </span>
        </div>
      </footer>
    </div>
  );
}
