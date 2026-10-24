import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import LandingHeader from '@/components/landing/LandingHeader';
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
  Phone,
  Send,
  MessageCircle,
  Mail,
  Download,
  CreditCard,
  Briefcase,
  Sparkles,
  Award,
  Layers,
  HeartHandshake,
} from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0C0F17] text-stone-900 dark:text-stone-100 flex flex-col relative overflow-hidden font-sans transition-colors duration-200">
      {/* Soft warm ambient lighting (natural, comforting, pleasant for human eyes) */}
      <div className="ambient-glow bg-amber-600/10 w-[400px] sm:w-[650px] h-[400px] sm:h-[650px] -top-24 -left-20" />
      <div className="ambient-glow bg-orange-700/10 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] top-1/3 -right-24" />
      <div className="ambient-glow bg-stone-700/15 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bottom-10 left-1/3" />

      {/* Navigation Header */}
      <LandingHeader isAuthenticated={Boolean(session)} />

      {/* Hero Section */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        {/* Soft Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-6">
          <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Электронные NFC-визитки, QR-коды и ссылки в одно касание</span>
        </div>

        <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 dark:text-white max-w-4xl mx-auto leading-[1.14]">
          Цифровая визитка, <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 dark:from-amber-200 dark:via-orange-300 dark:to-amber-400">
            которую приятно держать и передавать
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Приложите телефон собеседника к вашему стикеру или покажите QR-код. Контакты, услуги и мессенджеры сохраняются мгновенно без установки приложений.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
          <Link
            href={session ? "/dashboard" : "/auth/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-9 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-xl shadow-amber-600/25 text-sm sm:text-base transition active:scale-98"
          >
            <span>{session ? 'Перейти в личный кабинет' : 'Создать визитку бесплатно'}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <a
            href="#showcase"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 rounded-2xl bg-white dark:bg-stone-900/90 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-sm sm:text-base transition shadow-sm"
          >
            Посмотреть примеры
          </a>
        </div>

        {/* Tactile Real-Life Showcase: Physical NFC Card & Phone Tandem */}
        <div className="mt-16 sm:mt-20 max-w-4xl mx-auto grid md:grid-cols-12 gap-8 items-center text-left">
          {/* Left: Physical Smart NFC Card Mockup */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start space-y-4">
            <div className="relative group w-full max-w-[340px]">
              {/* Card Drop Shadow */}
              <div className="absolute -inset-1 rounded-3xl bg-amber-600/20 blur-xl opacity-50 group-hover:opacity-75 transition" />

              {/* Physical Card Mockup */}
              <div className="relative aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-tr from-[#141720] via-[#1a202c] to-[#141720] border border-amber-600/30 p-5 shadow-2xl flex flex-col justify-between text-white overflow-hidden">
                {/* Subtle texture highlight */}
                <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

                {/* Card Top: Chip + Contactless Symbol */}
                <div className="flex items-center justify-between">
                  {/* Smart EMV Chip with realistic contacts */}
                  <div className="w-11 h-9 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200/60 shadow-inner flex flex-col justify-around p-1">
                    <div className="h-0.5 w-full bg-amber-700/40 rounded" />
                    <div className="h-0.5 w-full bg-amber-700/40 rounded" />
                    <div className="h-0.5 w-full bg-amber-700/40 rounded" />
                  </div>

                  {/* Contactless Wave Icon */}
                  <div className="flex items-center gap-1.5 text-amber-400/90">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span className="text-[10px] font-mono tracking-widest uppercase">NFC</span>
                  </div>
                </div>

                {/* Card Middle: Brand Hologram */}
                <div className="my-auto">
                  <div className="text-xs uppercase tracking-widest font-semibold text-stone-400">
                    Smart Business Card
                  </div>
                  <div className="text-lg font-black tracking-wider text-white">CardHub Pro</div>
                </div>

                {/* Card Bottom: Holder Name + Details */}
                <div className="flex items-end justify-between border-t border-stone-800/80 pt-2.5">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-stone-400">Владелец</div>
                    <div className="text-xs font-mono font-bold tracking-wide text-stone-200">
                      ALEXEY MOROZOV
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400/80">NTAG215 • 2026</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-400 max-w-xs leading-relaxed text-center md:text-left">
              Физический стикер или металлическая карта с микрочипом NDEF. Записывайте вашу ссылку через NFC прямо с телефона.
            </p>
          </div>

          {/* Right: Phone Display with Filled Digital Card */}
          <div className="md:col-span-7">
            <div className="relative max-w-sm mx-auto">
              {/* Phone Frame */}
              <div className="p-3 sm:p-4 rounded-[36px] bg-[#161B26] border border-stone-800 shadow-2xl relative">
                {/* Dynamic Screen */}
                <div className="rounded-[28px] bg-[#121620] border border-stone-800/80 p-5 space-y-4 text-left">
                  {/* Header with Avatar & Badge */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 border-2 border-amber-400/50 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                      АМ
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>На связи онлайн</span>
                      </div>
                      <h3 className="font-bold text-base text-white">Алексей Морозов</h3>
                      <p className="text-xs text-amber-400 font-medium">Ведущий брокер • Prime Realty</p>
                    </div>
                  </div>

                  {/* Highlights / Numbers */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-center">
                    <div>
                      <div className="text-xs font-black text-amber-400">10+ лет</div>
                      <div className="text-[9px] text-stone-400">Опыт</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-400">450+</div>
                      <div className="text-[9px] text-stone-400">Сделок</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-400">⭐ 4.9</div>
                      <div className="text-[9px] text-stone-400">Рейтинг</div>
                    </div>
                  </div>

                  {/* Specialization Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300">
                      Новостройки МСК
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300">
                      Ипотека 6%
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300">
                      Инвестиции
                    </span>
                  </div>

                  {/* 1-Tap Quick Action Row */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span className="text-[9px] mt-1 font-medium">Звонок</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
                      <Send className="w-4 h-4 text-sky-400" />
                      <span className="text-[9px] mt-1 font-medium">Telegram</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-[9px] mt-1 font-medium">WhatsApp</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span className="text-[9px] mt-1 font-medium">Почта</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition">
                    <Download className="w-3.5 h-3.5" />
                    <span>Сохранить в телефон (.vcf)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Card Styles Showcase Section */}
      <section id="showcase" className="py-16 sm:py-24 border-t border-stone-800/80 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            Индивидуальный стиль
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
            Стили для любых сфер и профессий
          </h2>
          <p className="mt-2.5 text-stone-400 text-xs sm:text-sm">
            Выберите шаблон, который идеально передает статус вашей деятельности — от теплой редакторской классики до скандинавского минимализма
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Warm Editorial */}
          <div className="p-5 rounded-3xl bg-[#141824] border border-amber-900/30 space-y-4 hover:border-amber-600/40 transition">
            <div className="h-28 rounded-2xl bg-gradient-to-tr from-amber-950 to-stone-900 p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 w-fit">
                Недвижимость
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                АН
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Warm Editorial</h3>
              <p className="text-xs text-stone-400 mt-1">
                Теплый песочно-янтарный тон, элегантная антиква и презентабельные карточки услуг.
              </p>
            </div>
          </div>

          {/* Card 2: Executive Bronze */}
          <div className="p-5 rounded-3xl bg-[#0E1526] border border-amber-500/20 space-y-4 hover:border-amber-400/40 transition">
            <div className="h-28 rounded-2xl bg-gradient-to-tr from-blue-950 to-stone-900 p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/10 w-fit">
                Юристы и консалтинг
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-700 text-white font-bold text-xs flex items-center justify-center">
                МВ
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Executive Bronze</h3>
              <p className="text-xs text-stone-400 mt-1">
                Глубокий синий сапфир, акцент благородной бронзы, банковские реквизиты и статус.
              </p>
            </div>
          </div>

          {/* Card 3: Nordic Clean */}
          <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-stone-200 text-stone-900 space-y-4 hover:shadow-xl transition">
            <div className="h-28 rounded-2xl bg-stone-200/80 p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-teal-800 px-2 py-0.5 rounded-md bg-teal-600/10 w-fit">
                Дизайн и творчество
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                ЕС
              </div>
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Nordic Clean</h3>
              <p className="text-xs text-stone-600 mt-1">
                Светлый скандинавский фон, естественная бумага, чистая типографика и легкость.
              </p>
            </div>
          </div>

          {/* Card 4: Matte Graphite */}
          <div className="p-5 rounded-3xl bg-[#151921] border border-stone-800 space-y-4 hover:border-stone-700 transition">
            <div className="h-28 rounded-2xl bg-stone-900 p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-stone-300 px-2 py-0.5 rounded-md bg-stone-800 w-fit">
                IT & Стартапы
              </span>
              <div className="w-8 h-8 rounded-xl bg-stone-700 text-white font-bold text-xs flex items-center justify-center">
                ДК
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Matte Graphite</h3>
              <p className="text-xs text-stone-400 mt-1">
                Премиальный матовый бархатный графит, строгие формы и тактильная четкость.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-20 border-t border-stone-800/80 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Простой старт</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">Как работает CardHub</h2>
          <p className="mt-2.5 text-stone-400 text-xs sm:text-sm">
            Всего 3 шага отделяют вас от современного, удобного обмена контактами.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-stone-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">1. Создайте визитку</h3>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              Заполните имя, должность, компанию, добавьте телефон, мессенджеры, услуги, теги и выберите стиль оформления.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-stone-800">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">2. Запишите на NFC или QR</h3>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              Привяжите короткую ссылку к вашему NFC-стикеру прямо из браузера или скачайте готовый QR-код для печати.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-stone-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">3. Делитесь в одно касание</h3>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              Коснитесь телефоном стикера или покажите QR-код. Собеседник сразу видит визитку и сохраняет vCard в телефон.
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 border-t border-stone-800/80 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Честные цены</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">Прозрачные тарифы</h2>
          <p className="mt-2.5 text-stone-400 text-xs sm:text-sm">
            14 дней бесплатного пробного периода. Никаких скрытых платежей.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Regular Plan */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-800 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Обычный</h3>
                <p className="text-xs text-stone-400 mt-1">
                  Идеально для индивидуальных специалистов, риелторов и экспертов
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">290 ₽</span>
                <span className="text-sm text-stone-400">/ месяц</span>
              </div>

              <ul className="space-y-3 text-sm text-stone-300">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>1 цифровая визитка с полным наполнением</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Выбор из 7 дизайнерских стилей и 12 гармоничных палитр</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Блоки услуг, тегов, достижений и реквизитов СБП</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Запись на NFC-метки (NTAG213/215/216) и QR-код</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Мгновенное скачивание контакта (vCard 3.0)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Базовая статистика просмотров и переходов</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 sm:pt-8">
              <Link
                href="/auth/register"
                className="w-full inline-flex justify-center items-center py-3.5 px-4 rounded-xl font-semibold text-white bg-stone-850 hover:bg-stone-800 transition text-sm active:scale-98"
              >
                Попробовать бесплатно 14 дней
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-amber-500/50 relative flex flex-col justify-between shadow-2xl shadow-amber-600/10">
            <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[11px] font-bold tracking-wider uppercase whitespace-nowrap shadow-md border border-amber-400/30">
              Для команд и компаний
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Pro (Корпоративный)</span>
                  <Building2 className="w-5 h-5 text-amber-400" />
                </h3>
                <p className="text-xs text-stone-400 mt-1">Для агентств, отделов продаж и растущего бизнеса</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">990 ₽</span>
                <span className="text-sm text-stone-400">/ месяц</span>
              </div>

              <ul className="space-y-3 text-sm text-stone-300">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Всё из тарифа «Обычный»</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>До 10 сотрудников компании в одном кабинете</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Единый корпоративный брендинг (логотип, цвета)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Собственный короткий адрес визитки (/c/ivanov)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Массовый экспорт ссылок в CSV для быстрой записи меток</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Журнал аудита действий и расширенная аналитика</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 sm:pt-8">
              <Link
                href="/auth/register"
                className="w-full inline-flex justify-center items-center py-3.5 px-4 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/30 text-sm active:scale-98"
              >
                Подключить Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-14 sm:py-16 border-t border-stone-800/80 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="glass-panel p-6 sm:p-12 rounded-3xl border border-stone-800 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto md:mx-0">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Соответствие 152-ФЗ РФ</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Все сервера и персональные данные размещены на территории РФ. Полный отказ от зарубежных трекеров и сторонних шрифтов.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto md:mx-0">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">OWASP ASVS Уровень 2</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Хэширование паролей Argon2id, серверные сессии с HttpOnly Cookie, изоляция доступа и защита от IDOR.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto md:mx-0">
              <Radio className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Безопасная запись NFC</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              На метке хранится только URL. Ваши персональные данные не записываются в память чипа и всегда защищены.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-800/80 bg-[#0A0D14] py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-xs">
              CH
            </span>
            <span className="font-medium text-stone-400">CardHub © 2026</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/legal/pd-policy" className="hover:text-stone-300 transition">
              Политика обработки ПДн (152-ФЗ)
            </Link>
            <Link href="/legal/offer" className="hover:text-stone-300 transition">
              Публичная оферта
            </Link>
            <Link href="/auth/login" className="hover:text-stone-300 transition">
              Личный кабинет
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
