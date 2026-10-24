import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Политика использования файлов cookie — CardHub',
  description: 'Порядок использования технических и сессионных файлов cookie в сервисе цифровых визиток CardHub.',
};

export default function CookiePolicyPage() {
  return (
    <article className="space-y-8 text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
      {/* Шапка */}
      <div className="space-y-2 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          Безопасность и приватность
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
          Политика использования файлов cookie
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Редакция от 21 октября 2026 г. • Принципы минимизации сбора данных и суверенной аналитики
        </p>
      </div>

      {/* 1. Что такое файлы cookie */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <span className="text-amber-500">1.</span> Что такое файлы cookie
        </h2>
        <p>
          1.1. Файлы cookie (куки) представляют собой небольшие фрагменты текстовых данных, сохраняемые браузером на устройстве пользователя (компьютере, смартфоне, планшете) при посещении веб-сайта.
        </p>
        <p>
          1.2. Платформа <strong>«CardHub»</strong> придерживается принципа максимальной защиты конфиденциальности пользователей и минимизации обрабатываемых метаданных в соответствии с требованиями Федерального закона № 152-ФЗ «О персональных данных» и Федерального закона № 242-ФЗ.
        </p>
      </section>

      {/* 2. Категории используемых файлов cookie */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <span className="text-amber-500">2.</span> Перечень и назначение файлов cookie Сервиса
        </h2>
        <p>
          В Сервисе CardHub используются <strong>исключительно строго необходимые (технические) файлы cookie</strong>, без которых невозможно безопасное функционирование личного кабинета:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-1 shadow-sm dark:shadow-none text-stone-700 dark:text-stone-300">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900 dark:text-white font-mono">cardhub_session</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Сессионный (до 30 дней)</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Хранит случайно сгенерированный криптографический идентификатор сессии пользователя для авторизации в Личном кабинете. Имеет флаги максимальной защиты: <code>HttpOnly</code> (недоступен для JavaScript/XSS-атак), <code>Secure</code> (передается только по HTTPS) и <code>SameSite=Lax</code> (защита от CSRF).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-1 shadow-sm dark:shadow-none text-stone-700 dark:text-stone-300">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900 dark:text-white font-mono">cardhub_cookie_consent</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">1 год</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Фиксирует факт ознакомления пользователя с предупреждением о применении файлов cookie, чтобы баннер не отображался повторно при каждом переходе.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Отсутствие сторонних трекеров (242-ФЗ) */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <span className="text-amber-500">3.</span> Принципиальный отказ от сторонних трекеров (242-ФЗ)
        </h2>
        <p>
          3.1. Сервис CardHub <strong>не использует</strong> сторонние рекламные сети, отслеживающие пиксели социальных сетей, а также зарубежные системы веб-аналитики (Google Analytics, Meta Pixel и аналогичные).
        </p>
        <p>
          3.2. Статистика переходов по визиткам (счетчики NFC, QR и прямых ссылок) агрегируется непосредственно на сервере в Российской Федерации без применения рекламных идентификаторов, без слежения за поведением пользователей на сторонних сайтах и без сохранения персональных IP-адресов посетителей.
        </p>
      </section>

      {/* 4. Управление и отключение cookie */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <span className="text-amber-500">4.</span> Порядок управления файлами cookie
        </h2>
        <p>
          4.1. Большинство современных браузеров автоматически разрешают сохранение файлов cookie. Пользователь может в любой момент изменить настройки браузера, заблокировать сохранение файлов cookie или удалить уже сохраненные файлы.
        </p>
        <p>
          4.2. Обратите внимание: при полном отключении технических файлов cookie в браузере авторизация и функционирование защищенного Личного кабинета CardHub станут невозможными.
        </p>
      </section>

      {/* 5. Изменение Политики */}
      <section className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <span className="text-amber-500">5.</span> Актуализация документа
        </h2>
        <p>
          Оператор оставляет за собой право вносить изменения в настоящую Политику при обновлении функционала Сервиса или изменении законодательства РФ. Актуальная версия всегда доступна по адресу <Link href="/legal/cookies" className="text-amber-600 dark:text-amber-400 hover:underline">https://ваш-домен.ru/legal/cookies</Link>.
        </p>
      </section>
    </article>
  );
}
