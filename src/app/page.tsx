import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import {
  Smartphone,
  QrCode,
  Radio,
  Share2,
  Shield,
  Zap,
  Users,
  Building2,
  Check,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow bg-blue-600/30 w-[600px] h-[600px] -top-40 -left-40" />
      <div className="ambient-glow bg-indigo-500/20 w-[600px] h-[600px] top-1/3 -right-40" />
      <div className="ambient-glow bg-emerald-500/15 w-[500px] h-[500px] bottom-10 left-1/4" />

      {/* Navigation */}
      <nav className="glass-panel border-b border-slate-800/80 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
              CH
            </span>
            <span className="text-xl font-bold tracking-tight text-white">CardHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition">Как это работает</a>
            <a href="#features" className="hover:text-white transition">Возможности</a>
            <a href="#pricing" className="hover:text-white transition">Тарифы</a>
            <a href="#security" className="hover:text-white transition">Безопасность</a>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center gap-2"
              >
                <span>Личный кабинет</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-800/60 transition"
                >
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl shadow-lg shadow-blue-600/25 transition active:scale-95"
                >
                  Создать визитку
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
          <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
          <span>Поддержка NFC стикеров, QR и коротких ссылок</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Цифровая визитка, <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            готовая к передаче в одно касание
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Приложите телефон собеседника к вашему стикеру или покажите QR-код. Контакты сохраняются мгновенно без установки приложений.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={session ? "/dashboard" : "/auth/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xl shadow-blue-600/30 text-base transition active:scale-98"
          >
            <span>{session ? 'Перейти в личный кабинет' : 'Создать бесплатно'}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base transition"
          >
            Тарифы для бизнеса
          </a>
        </div>

        {/* Visual Card Showcase */}
        <div className="mt-16 relative max-w-sm mx-auto">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-30 blur-xl animate-pulse" />
          <div className="relative glass-panel rounded-3xl p-6 border border-slate-700 shadow-2xl text-left space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
                АМ
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Алексей Морозов</h3>
                <p className="text-xs text-blue-400 font-medium">Руководитель проектов • TechHub</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Москва • Открыт к предложениям
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Управление разработкой финтех-продуктов и цифровых сервисов. Рад новым профессиональным знакомствам!
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200">
                <span className="text-slate-400">Телефон:</span>
                <span className="font-mono font-medium">+7 (999) 123-45-67</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200">
                <span className="text-slate-400">Telegram:</span>
                <span className="text-blue-400 font-medium">@alexey_morozov</span>
              </div>
            </div>

            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold tracking-wide uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
              Сохранить в контакты (.vcf)
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 border-t border-slate-900 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Как работает CardHub</h2>
          <p className="mt-3 text-slate-400 text-sm">
            Всего 3 простых шага для перехода на современный формат обмена контактами.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">1. Создайте визитку</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Заполните контакты, ссылки на Telegram, WhatsApp, соцсети, загрузите фото и выберите индивидуальный стиль.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">2. Запишите на метку</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Используйте Web NFC прямо в браузере или бесплатное приложение NFC Tools для записи вашей персональной ссылки на стикер.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">3. Делитесь в касание</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Коснитесь телефоном стикера или покажите QR-код на экране. Собеседник сразу видит визитку и сохраняет vCard в телефонную книгу.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-slate-900 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Прозрачные тарифы</h2>
          <p className="mt-3 text-slate-400 text-sm">
            Выберите подходящий тариф для себя или настройте единый корпоративный стиль компании.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Regular Plan */}
          <div className="glass-card p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Обычный</h3>
                <p className="text-xs text-slate-400 mt-1">Идеально для индивидуальных специалистов и фрилансеров</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">290 ₽</span>
                <span className="text-sm text-slate-400">/ месяц</span>
              </div>

              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 цифровая визитка</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Выбор из набора дизайнерских шаблонов</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Генерация и скачивание QR-кода (SVG / PNG)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Запись на NFC-метки (NTAG213/215/216)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Скачивание файла контакта (vCard 3.0)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Базовая статистика просмотров</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/auth/register"
                className="w-full inline-flex justify-center items-center py-3.5 px-4 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 transition text-sm"
              >
                Выбрать «Обычный»
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="glass-panel p-8 rounded-3xl border-2 border-blue-500/50 relative flex flex-col justify-between shadow-2xl shadow-blue-500/10">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold tracking-wider uppercase">
              Для компаний
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Pro (Корпоративный)</span>
                  <Building2 className="w-5 h-5 text-blue-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">Для команд, агентств и растущего бизнеса</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">1 490 ₽</span>
                <span className="text-sm text-slate-400">/ месяц</span>
              </div>

              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span><strong>Всё из тарифа «Обычный»</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>До 10 сотрудников в компании</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Единый корпоративный брендинг (логотип, цвета)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Собственный короткий адрес визитки (slug)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Массовый экспорт ссылок в CSV для записи меток</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Журнал аудита действий над визитками</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Расширенная аналитика по всей компании</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/auth/register"
                className="w-full inline-flex justify-center items-center py-3.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 text-sm"
              >
                Подключить Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-16 border-t border-slate-900 px-6 max-w-6xl mx-auto">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto md:mx-0">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Соответствие 152-ФЗ и 242-ФЗ</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Все сервера и персональные данные пользователей размещены на территории РФ. Полный отказ от зарубежных трекеров и шрифтов.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto md:mx-0">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Стандарты OWASP ASVS Уровень 2</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Хэширование паролей Argon2id, серверные защищенные сессии с HttpOnly Cookie, изоляция доступа и защита от IDOR.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto md:mx-0">
              <Radio className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Чистая запись на NFC</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              На метке хранится только защищенный короткий URL. Персональные данные не записываются в память чипа и всегда защищены.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              CH
            </span>
            <span className="font-medium text-slate-400">CardHub © 2026</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/legal/pd-policy" className="hover:text-slate-300 transition">
              Политика обработки ПДн (152-ФЗ)
            </Link>
            <Link href="/legal/offer" className="hover:text-slate-300 transition">
              Публичная оферта
            </Link>
            <Link href="/auth/login" className="hover:text-slate-300 transition">
              Личный кабинет
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
