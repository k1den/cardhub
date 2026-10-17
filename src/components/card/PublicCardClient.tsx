'use client';

import React, { useState } from 'react';
import CardRenderer, { CardRenderData } from './CardRenderer';
import { X, QrCode, Download, AlertTriangle, Check, Loader2 } from 'lucide-react';

interface PublicCardClientProps {
  card: CardRenderData;
  cardUrl: string;
}

export default function PublicCardClient({ card, cardUrl }: PublicCardClientProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // QR State
  const [qrPngUrl, setQrPngUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  // Report State
  const [reportReason, setReportReason] = useState('Спам или нежелательный контент');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleOpenQr = async () => {
    setShowQrModal(true);
    if (!qrPngUrl) {
      setLoadingQr(true);
      try {
        const res = await fetch(`/api/cards/${card.slug}/qr?format=png`);
        const data = await res.json();
        if (data.dataUrl) {
          setQrPngUrl(data.dataUrl);
        }
      } catch (err) {
        console.error('Failed to load QR PNG:', err);
      } finally {
        setLoadingQr(false);
      }
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError(null);
    setReportSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: card.slug,
          reason: reportReason,
          details: reportDetails,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setReportError(data.error || 'Ошибка при отправке жалобы');
        setReportSubmitting(false);
        return;
      }

      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportDetails('');
      }, 2500);
    } catch {
      setReportError('Не удалось отправить жалобу. Попробуйте позже.');
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <>
      <CardRenderer
        card={card}
        isPreview={false}
        onOpenQr={handleOpenQr}
        onOpenReport={() => setShowReportModal(true)}
      />

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-slate-700 shadow-2xl relative text-center space-y-5">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-2">
              <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-blue-400" />
                <span>QR-код визитки</span>
              </h3>
              <p className="text-xs text-slate-400">
                Наведите камеру смартфона для быстрого перехода
              </p>
            </div>

            {/* QR View Container */}
            <div className="p-4 rounded-2xl bg-white mx-auto w-64 h-64 flex items-center justify-center shadow-inner">
              {loadingQr ? (
                <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
              ) : qrPngUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrPngUrl}
                  alt={`QR-код для ${card.fullName}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-xs text-slate-500">Загрузка QR...</div>
              )}
            </div>

            {/* Download Button */}
            {qrPngUrl && (
              <div className="pt-1">
                <a
                  href={qrPngUrl}
                  download={`qr-${card.slug}.png`}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать QR в высоком разрешении (PNG)</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative text-left space-y-5">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Пожаловаться на визитку</span>
              </h3>
              <p className="text-xs text-slate-400">
                Мы соблюдаем 149-ФЗ и оперативно реагируем на нарушения правил размещения контента.
              </p>
            </div>

            {reportSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-sm">Жалоба отправлена</h4>
                <p className="text-xs text-slate-300">
                  Спасибо! Модератор платформы рассмотрит обращение в ближайшее время.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                {reportError && (
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                    {reportError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Причина обращения
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Спам или нежелательный контент">Спам или нежелательный контент</option>
                    <option value="Недостоверная информация или мошенничество">
                      Недостоверная информация или мошенничество
                    </option>
                    <option value="Нарушение авторских прав или товарных знаков">
                      Нарушение авторских прав или товарных знаков
                    </option>
                    <option value="Оскорбления или запрещенные материалы">
                      Оскорбления или запрещенные материалы (149-ФЗ)
                    </option>
                    <option value="Другое">Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Дополнительные сведения (необязательно)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Опишите подробности нарушения..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition shadow-lg shadow-rose-600/30 disabled:opacity-50"
                  >
                    {reportSubmitting ? 'Отправка...' : 'Отправить жалобу'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
