'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Check,
  Copy,
  AlertTriangle,
  Loader2,
  Smartphone,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface WebNfcWriterProps {
  slug: string;
  cardTitle: string;
}

export default function WebNfcWriter({ slug, cardTitle }: WebNfcWriterProps) {
  const [copied, setCopied] = useState(false);
  const [isWebNfcSupported, setIsWebNfcSupported] = useState(false);
  const [writing, setWriting] = useState(false);
  const [writeSuccess, setWriteSuccess] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'iphone' | 'chips'>('android');

  // Compute full target NFC link with ?s=nfc query parameter (Section 4.4)
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    setTargetUrl(`${origin}/c/${slug}?s=nfc`);

    // Check Web NFC support (available in Android Chrome over HTTPS or localhost)
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setIsWebNfcSupported(true);
    }
  }, [slug]);

  const handleCopy = async () => {
    if (!targetUrl) return;
    await navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Web NFC writer using NDEFReader.write
  const handleWriteNfc = async () => {
    if (!('NDEFReader' in window)) {
      setWriteError('Web NFC не поддерживается в этом браузере.');
      return;
    }

    setWriting(true);
    setWriteSuccess(false);
    setWriteError(null);

    try {
      // @ts-ignore - NDEFReader is standard experimental Web NFC API
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: targetUrl,
          },
        ],
      });

      setWriteSuccess(true);
      setWriting(false);
    } catch (err: any) {
      console.error('NFC Write Error:', err);
      setWriting(false);
      if (err.name === 'NotAllowedError') {
        setWriteError('Доступ к NFC был отклонен. Разрешите доступ к NFC в настройках браузера.');
      } else {
        setWriteError(`Не удалось записать метку: ${err.message || 'Ошибка связи с чипом'}`);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Link Card & Web NFC Action */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400" />
              <span>Ссылка для записи на NFC-метку</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Метка хранит только короткий защищенный адрес с параметром источника <code>?s=nfc</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Без ПДн на чипе (152-ФЗ)
            </span>
          </div>
        </div>

        {/* Copy Link Row */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
          <input
            type="text"
            readOnly
            value={targetUrl}
            className="flex-1 bg-transparent px-3 text-xs sm:text-sm font-mono text-slate-200 outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-md shadow-blue-600/30 flex items-center gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Скопировать</span>
              </>
            )}
          </button>
        </div>

        {/* Web NFC One-Click Trigger for Android Chrome */}
        {isWebNfcSupported ? (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Прямая запись через Web NFC (Chrome на Android)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Вы можете записать чип прямо из этого браузера без установки сторонних приложений!
                </p>
              </div>
            </div>

            {writeSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-5 h-5 shrink-0 text-emerald-400" />
                <div>
                  <strong>Успешно записано!</strong> Поднесите телефон к метке ещё раз, чтобы убедиться, что открывается ваша визитка.
                </div>
              </div>
            ) : writing ? (
              <div className="p-4 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-3 animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400 shrink-0" />
                <div>
                  <strong>Ожидание касания...</strong> Поднесите чип/стикер NTAG к верхней или средней части задней крышки телефона.
                </div>
              </div>
            ) : null}

            {writeError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{writeError}</span>
              </div>
            )}

            {!writing && !writeSuccess && (
              <button
                onClick={handleWriteNfc}
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>Записать метку в одно касание</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-slate-200 font-semibold block">
                Запись через бесплатное приложение (iOS и Android)
              </span>
              <span>
                Браузер Safari на iPhone не разрешает сайтам прямую запись NFC по соображениям политики Apple. Чтобы записать чип на iPhone или других устройствах, воспользуйтесь бесплатным приложением <strong>NFC Tools</strong> (инструкция ниже).
              </span>
            </div>
          </div>
        )}

        {/* Lock Tag Warning */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <strong>Важное предупреждение о блокировке чипа (Lock tag):</strong>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Метка хранит только ссылку, а все данные вы можете в любой момент менять в личном кабинете. Не устанавливайте блокировку метки от перезаписи (Lock / Read-Only), если хотите сохранить возможность перезаписать чип в будущем. Блокировка необратима.
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Instructions Tabs */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white">Инструкция по записи на метку</h3>

          {/* Guide Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveGuideTab('iphone')}
              className={`py-1.5 px-3 rounded-lg font-medium transition ${
                activeGuideTab === 'iphone' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              iPhone (iOS)
            </button>
            <button
              onClick={() => setActiveGuideTab('android')}
              className={`py-1.5 px-3 rounded-lg font-medium transition ${
                activeGuideTab === 'android' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setActiveGuideTab('chips')}
              className={`py-1.5 px-3 rounded-lg font-medium transition ${
                activeGuideTab === 'chips' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              О чипах (NTAG)
            </button>
          </div>
        </div>

        {/* Guide Content: iPhone */}
        {activeGuideTab === 'iphone' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h4 className="font-bold text-white text-xs">Установите NFC Tools</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Скачайте бесплатное приложение «NFC Tools» из App Store.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h4 className="font-bold text-white text-xs">Добавьте запись</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Откройте приложение ➔ выберите вкладку <strong>«Запись»</strong> ➔ нажмите <strong>«Добавить запись»</strong> ➔ выберите <strong>«Пользовательский URL / URI»</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <h4 className="font-bold text-white text-xs">Вставьте ссылку</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Вставьте скопированную ссылку выше (начинается с <code className="text-blue-400">https://</code>) и нажмите «OK».
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                <h4 className="font-bold text-white text-xs">Приложите метку</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Нажмите <strong>«Записать»</strong> и приложите метку к верхней части iPhone (возле камеры). Запись займёт 1 секунду.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Guide Content: Android */}
        {activeGuideTab === 'android' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            <p className="text-xs text-slate-400 leading-relaxed">
              На Android вы можете использовать либо кнопку <strong>«Записать в одно касание»</strong> прямо выше в браузере Chrome, либо приложение NFC Tools из Google Play:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h4 className="font-bold text-white text-xs">Включите NFC</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Убедитесь, что переключатель NFC включен в шторке быстрых настроек Android.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h4 className="font-bold text-white text-xs">Запись через Web NFC</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Нажмите кнопку записи выше и поднесите метку к задней крышке смартфона.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <h4 className="font-bold text-white text-xs">Готово к работе</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Теперь при касании чужой смартфон автоматически откроет вашу визитку без каких-либо приложений.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Guide Content: Chips Info */}
        {activeGuideTab === 'chips' && (
          <div className="space-y-4 text-xs text-slate-300">
            <p className="text-xs text-slate-400 leading-relaxed">
              Платформа CardHub совместима со всеми стандартными NFC-чипами NXP серии NTAG. Поскольку мы записываем только короткую компактную ссылку, подходит даже самый доступный чип:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm">NTAG213</div>
                <div className="text-xs text-blue-400 font-mono">144 байта памяти</div>
                <p className="text-[11px] text-slate-400">
                  Самый популярный и экономичный чип. Ссылка CardHub занимает ~35 байт, поэтому NTAG213 подходит идеально.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm">NTAG215</div>
                <div className="text-xs text-indigo-400 font-mono">504 байта памяти</div>
                <p className="text-[11px] text-slate-400">
                  Универсальный стандарт (используется также для фигурок Amiibo и карт). Полная совместимость со всеми смартфонами.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm">NTAG216</div>
                <div className="text-xs text-purple-400 font-mono">888 байт памяти</div>
                <p className="text-[11px] text-slate-400">
                  Максимальный объём памяти. Поддерживается так же бесшовно.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
