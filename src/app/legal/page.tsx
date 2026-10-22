import React from 'react';
import Link from 'next/link';
import { FileText, Shield, UserCheck, Share2, Cookie, AlertTriangle, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Юридические документы и правовая информация — CardHub',
  description: 'Политика конфиденциальности (152-ФЗ), публичная оферта, согласия на обработку и распространение персональных данных сервиса CardHub.',
};

export default function LegalIndexPage() {
  const documents = [
    {
      title: 'Публичная оферта сервиса CardHub',
      badge: 'Договор',
      law: 'ст. 437 ГК РФ',
      desc: 'Условия предоставления доступа к сервису, тарифные планы («Обычный» и «Pro»), порядок оплаты, продления и возвратов.',
      href: '/legal/offer',
      icon: FileText,
      accent: '#d97706',
    },
    {
      title: 'Политика обработки персональных данных',
      badge: 'Конфиденциальность',
      law: '152-ФЗ и 242-ФЗ',
      desc: 'Порядок сбора, хранения, локализации баз данных на территории РФ, сроки уничтожения и права субъектов персональных данных.',
      href: '/legal/pd-policy',
      icon: Shield,
      accent: '#2563eb',
    },
    {
      title: 'Согласие на обработку персональных данных',
      badge: '152-ФЗ',
      law: 'ст. 9 152-ФЗ',
      desc: 'Индивидуальное информированное согласие пользователя при создании аккаунта на платформе CardHub.',
      href: '/legal/pd-consent',
      icon: UserCheck,
      accent: '#0d9488',
    },
    {
      title: 'Согласие на распространение персональных данных',
      badge: 'Публикация визитки',
      law: 'ст. 10.1 152-ФЗ',
      desc: 'Разрешение субъекта на публичное размещение контактов и сведений в сети Интернет для неограниченного круга лиц.',
      href: '/legal/pd-distribution',
      icon: Share2,
      accent: '#a855f7',
    },
    {
      title: 'Политика использования файлов cookie',
      badge: 'Файлы Cookie',
      law: 'Технические сессии',
      desc: 'Правила применения необходимых технических сессионных cookie для безопасной аутентификации без сторонних трекеров.',
      href: '/legal/cookies',
      icon: Cookie,
      accent: '#f59e0b',
    },
    {
      title: 'Правила размещения контента и модерация',
      badge: 'Модерация',
      law: '149-ФЗ РФ',
      desc: 'Требования к недопустимому контенту на визитках, процедура подачи жалоб и порядок оперативной блокировки нарушений.',
      href: '/legal/content-rules',
      icon: AlertTriangle,
      accent: '#e11d48',
    },
  ];

  return (
    <article className="space-y-8 text-stone-300 text-sm leading-relaxed">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-stone-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Правовая прозрачность и соответствие законодательству РФ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Юридические документы и соглашения
        </h1>
        <p className="text-xs text-stone-400">
          Актуальные редакции правовых документов платформы CardHub от 21 октября 2026 г.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {documents.map((doc, idx) => {
          const Icon = doc.icon;
          return (
            <Link
              key={idx}
              href={doc.href}
              className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 hover:border-amber-500/30 transition flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition group-hover:scale-105 shrink-0"
                    style={{ backgroundColor: `${doc.accent}20`, color: doc.accent }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300">
                    {doc.law}
                  </span>
                </div>

                <div>
                  <h2 className="font-bold text-white text-sm group-hover:text-amber-400 transition">
                    {doc.title}
                  </h2>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    {doc.desc}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                <span>Читать документ</span>
                <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 text-xs text-stone-400 space-y-1.5">
        <h3 className="font-bold text-white text-sm">Обратная связь по правовым вопросам</h3>
        <p>
          По любым вопросам относительно положений оферты, обработки персональных данных или направления запросов вы можете связаться со службой поддержки по адресу: <strong className="text-stone-200">privacy@ваш-домен.ru</strong>
        </p>
      </div>
    </article>
  );
}
