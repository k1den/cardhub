'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Building2, Settings, ShieldCheck, Contact2, LayoutDashboard } from 'lucide-react';

interface MobileNavProps {
  isAdmin?: boolean;
}

export default function MobileNav({ isAdmin = false }: MobileNavProps) {
  const pathname = usePathname();

  const isCardsActive = pathname === '/dashboard' || pathname.startsWith('/dashboard/cards');
  const isCompanyActive = pathname.startsWith('/dashboard/company');
  const isSubscriptionActive = pathname.startsWith('/dashboard/subscription');
  const isSettingsActive = pathname.startsWith('/dashboard/settings');
  const isAdminActive = pathname.startsWith('/admin');

  return (
    <nav
      aria-label="Мобильная навигация"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-1 py-1 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-2xl shadow-black"
    >
      <div className="flex items-center justify-around">
        {/* Cards / Dashboard */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-medium transition min-w-[56px] ${
            isCardsActive
              ? 'text-blue-400 font-bold bg-blue-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Contact2 className={`w-5 h-5 mb-0.5 ${isCardsActive ? 'text-blue-400' : 'text-slate-400'}`} />
          <span>Визитки</span>
        </Link>

        {/* Company */}
        <Link
          href="/dashboard/company"
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-medium transition min-w-[56px] ${
            isCompanyActive
              ? 'text-indigo-400 font-bold bg-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className={`w-5 h-5 mb-0.5 ${isCompanyActive ? 'text-indigo-400' : 'text-indigo-400/80'}`} />
          <span>Компания</span>
        </Link>

        {/* Subscription */}
        <Link
          href="/dashboard/subscription"
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-medium transition min-w-[56px] ${
            isSubscriptionActive
              ? 'text-blue-400 font-bold bg-blue-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className={`w-5 h-5 mb-0.5 ${isSubscriptionActive ? 'text-blue-400' : 'text-blue-400/80'}`} />
          <span>Тариф</span>
        </Link>

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-medium transition min-w-[56px] ${
            isSettingsActive
              ? 'text-white font-bold bg-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className={`w-5 h-5 mb-0.5 ${isSettingsActive ? 'text-white' : 'text-slate-400'}`} />
          <span>Настройки</span>
        </Link>

        {/* Admin (Only if Admin) */}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-medium transition min-w-[56px] ${
              isAdminActive
                ? 'text-amber-300 font-bold bg-amber-500/15'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5 text-amber-400" />
            <span>Админка</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
