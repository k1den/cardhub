'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('cardhub_theme') as 'dark' | 'light' | null;
    if (stored) {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<'dark' | 'light'>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };

    window.addEventListener('cardhub_theme_change', handleThemeChange);
    return () => window.removeEventListener('cardhub_theme_change', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('cardhub_theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    window.dispatchEvent(new CustomEvent('cardhub_theme_change', { detail: nextTheme }));
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl bg-stone-200/50 dark:bg-stone-850 border border-stone-300 dark:border-stone-800 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative p-2 rounded-xl transition-all duration-200 border bg-stone-100 hover:bg-stone-200 border-stone-300/80 text-stone-700 dark:bg-stone-850 dark:hover:bg-stone-800 dark:border-stone-800 dark:text-stone-300 hover:scale-105 active:scale-95 cursor-pointer shadow-sm group"
      title={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-amber-600 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>
    </button>
  );
}
