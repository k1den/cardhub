import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import LogoutButton from '@/components/dashboard/LogoutButton';
import MobileNav from '@/components/dashboard/MobileNav';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { CreditCard, Settings, ShieldCheck, Building2 } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const roleLabel = session.user.role === 'ADMIN' ? 'Администратор' : session.user.role === 'PRO' ? 'Pro' : 'Обычный';

  return (
    <div className="min-h-screen w-full min-w-full max-w-full bg-[#F8FAFC] dark:bg-[#0C0F17] text-stone-900 dark:text-stone-100 flex flex-col font-sans overflow-x-clip transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full min-w-full border-b border-stone-200 dark:border-stone-800/80 bg-white/90 dark:bg-stone-900/80 backdrop-blur sticky top-0 z-30 px-4 py-3 sm:px-6 sm:py-3.5 transition-colors">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-amber-600/25 group-hover:scale-105 transition shrink-0">
                CH
              </span>
              <span className="font-bold tracking-tight text-stone-900 dark:text-white text-base sm:text-lg">CardHub</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60 transition"
              >
                Мои визитки
              </Link>
              <Link
                href="/dashboard/company"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60 transition flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Компания</span>
              </Link>
              <Link
                href="/dashboard/subscription"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60 transition flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Подписка</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60 transition flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                <span>Настройки</span>
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Админка</span>
                </Link>
              )}
            </nav>

            <Link
              href="/dashboard/subscription"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-800 dark:text-amber-400 text-xs font-bold transition"
            >
              <span>{roleLabel}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-stone-800 dark:text-stone-200">{session.user.email}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Email подтвержден
              </div>
            </div>

            <div className="h-6 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block" />

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Container with bottom padding for mobile navigation bar */}
      <main className="flex-1 w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav isAdmin={session.user.role === 'ADMIN'} />

      {/* Footer */}
      <footer className="w-full min-w-full border-t border-stone-200 dark:border-stone-800/80 bg-white/50 dark:bg-transparent py-6 text-center text-xs text-stone-500 mt-auto mb-16 md:mb-0 transition-colors">
        <div className="w-full max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
            <span>Данные зашифрованы и локализованы в РФ (152-ФЗ / 242-ФЗ) • CardHub © 2026</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-500">
            <Link href="/legal/pd-consent" className="hover:text-stone-700 dark:hover:text-stone-300 transition">
              Согласие на ПДн
            </Link>
            <Link href="/legal/pd-distribution" className="hover:text-stone-700 dark:hover:text-stone-300 transition">
              Распространение ПДн
            </Link>
            <Link href="/legal/cookies" className="hover:text-stone-700 dark:hover:text-stone-300 transition">
              Файлы cookie
            </Link>
            <Link href="/legal/content-rules" className="hover:text-stone-700 dark:hover:text-stone-300 transition">
              Правила контента (149-ФЗ)
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
