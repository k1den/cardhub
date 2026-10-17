import React from 'react';

export const metadata = {
  title: 'Политика использования файлов cookie — CardHub',
  description: 'Порядок применения технических и аналитических файлов cookie на платформе CardHub.',
};

export default function CookiePolicyPage() {
  return (
    <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
        ⚠️ Документ подготовлен для платформы CardHub. Подлежит согласованию с юристом заказчика до запуска.
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Политика использования файлов cookie
        </h1>
        <p className="text-xs text-slate-400">
          Редакция от 17 октября 2026 г. • Принципы приватности и локальной аналитики
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">1. Что такое файлы cookie</h2>
        <p>
          Файлы cookie (куки) — это небольшие текстовые фрагменты данных, сохраняемые браузером на устройстве пользователя при посещении веб-сайта. Сервис <strong>«CardHub»</strong> придерживается принципа максимальной минимизации собираемых данных и соблюдения законов РФ (152-ФЗ и 242-ФЗ).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">2. Строго необходимые (технические) cookie</h2>
        <p>
          Технические файлы cookie необходимы для функционирования сервиса и безопасности. Они устанавливаются автоматически без обязательного согласия субъекта (в соответствии с нормами 152-ФЗ):
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>cardhub_session</strong>: зашифрованный серверный идентификатор сессии (HttpOnly, Secure, SameSite=Lax) для авторизации пользователя в личном кабинете;</li>
          <li><strong>cardhub_cookie_consent</strong>: сохранение факта ознакомления пользователя с предупреждением о cookie;</li>
          <li>Временные токены защиты от межсайтовой подделки запросов (CSRF).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">3. Отсутствие сторонних зарубежных трекеров (242-ФЗ)</h2>
        <p>
          Сервис CardHub <strong>не использует</strong> сторонние зарубежные сервисы веб-аналитики (Google Analytics, трекинговые пиксели зарубежных соцсетей). Все счётчики просмотров и переходов с NFC-меток агрегируются строго на сервере без привязки к сырым IP-адресам и без использования следящих cookie.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">4. Управление файлами cookie</h2>
        <p>
          Вы можете отключить сохранение cookie или удалить уже сохраненные файлы в настройках вашего браузера. Обратите внимание, что при блокировке технических cookie вход в личный кабинет будет невозможен.
        </p>
      </section>
    </div>
  );
}
