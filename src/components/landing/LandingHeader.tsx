'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Radio, Sparkles } from 'lucide-react';

interface LandingHeaderProps {
  isAuthenticated: boolean;
}

export default function LandingHeader({ isAuthenticated }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="glass-panel border-b border-stone-800/80 sticky top-0 z-50 px-4 sm:px-6 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group" onClick={closeMenu}>
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-lg shadow-amber-600/25 group-hover:scale-105 transition shrink-0">
            CH
          </span>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">CardHub</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
          <a href="#how-it-works" className="hover:text-amber-400 transition">Как это работает</a>
          <a href="#showcase" className="hover:text-amber-400 transition">Стили визиток</a>
          <a href="#pricing" className="hover:text-amber-400 transition">Тарифы</a>
          <a href="#security" className="hover:text-amber-400 transition">Безопасность</a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-xl shadow-lg shadow-amber-600/25 transition flex items-center gap-2"
            >
              <span>Личный кабинет</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-stone-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-stone-850 transition"
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-xl shadow-lg shadow-amber-600/25 transition active:scale-95"
              >
                Создать визитку
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-white bg-amber-600 px-3 py-2 rounded-lg flex items-center gap-1.5"
            >
              <span>Кабинет</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs font-medium text-stone-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-stone-800"
            >
              Войти
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition cursor-pointer"
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-slate-800/80 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1 px-1 text-sm font-medium text-slate-300">
            <a
              href="#how-it-works"
              onClick={closeMenu}
              className="py-2.5 px-3 rounded-lg hover:bg-slate-800/70 hover:text-white transition"
            >
              Как это работает
            </a>
            <a
              href="#pricing"
              onClick={closeMenu}
              className="py-2.5 px-3 rounded-lg hover:bg-slate-800/70 hover:text-white transition"
            >
              Тарифы
            </a>
            <a
              href="#security"
              onClick={closeMenu}
              className="py-2.5 px-3 rounded-lg hover:bg-slate-800/70 hover:text-white transition"
            >
              Безопасность (152-ФЗ)
            </a>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800/80 px-1 space-y-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md shadow-blue-600/30"
              >
                <span>Перейти в личный кабинет</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Создать визитку бесплатно</span>
                </Link>
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-medium"
                >
                  Войти в аккаунт
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
