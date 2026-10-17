'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 py-1.5 px-3 rounded-lg hover:bg-slate-850 border border-transparent hover:border-slate-800 transition"
      title="Выйти из аккаунта"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{loading ? 'Выход...' : 'Выйти'}</span>
    </button>
  );
}
