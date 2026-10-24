'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Trash2,
  KeyRound,
  Check,
  AlertTriangle,
  Loader2,
  Lock,
  Copy,
  ExternalLink,
  Shield,
  X,
} from 'lucide-react';

interface UserSettingsClientProps {
  user: {
    id: string;
    email: string;
    role: string;
    totpEnabled: boolean;
    createdAt: string;
  };
}

export default function UserSettingsClient({ user }: UserSettingsClientProps) {
  const [totpEnabled, setTotpEnabled] = useState(user.totpEnabled);

  // 2FA Setup State
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // 2FA Disable State
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  // Account Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const startTotpSetup = async () => {
    setLoadingSetup(true);
    setSetupError(null);
    setVerificationCode('');
    setSetupModalOpen(true);

    try {
      const res = await fetch('/api/auth/2fa/setup');
      const data = await res.json();

      if (!res.ok) {
        setSetupError(data.error || 'Ошибка при генерации ключа 2FA');
        setLoadingSetup(false);
        return;
      }

      setQrCodeUrl(data.qrCodeUrl);
      setTotpSecret(data.secret);
    } catch {
      setSetupError('Не удалось связаться с сервером');
    } finally {
      setLoadingSetup(false);
    }
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setSetupError(null);

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSetupError(data.error || 'Неверный код подтверждения');
        setVerifying(false);
        return;
      }

      setTotpEnabled(true);
      setSetupModalOpen(false);
    } catch {
      setSetupError('Сетевая ошибка');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabling(true);
    setDisableError(null);

    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDisableError(data.error || 'Неверный пароль');
        setDisabling(false);
        return;
      }

      setTotpEnabled(false);
      setDisableModalOpen(false);
      setDisablePassword('');
    } catch {
      setDisableError('Сетевая ошибка');
    } finally {
      setDisabling(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Неверный пароль');
        setDeleting(false);
        return;
      }

      window.location.href = '/';
    } catch {
      setDeleteError('Не удалось удалить аккаунт');
      setDeleting(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="w-full min-w-full pb-4 border-b border-stone-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-amber-500" />
          <span>Настройки безопасности и приватности</span>
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Двухфакторная аутентификация (2FA), выгрузка и управление персональными данными (152-ФЗ)
        </p>
      </div>

      {/* Profile Overview */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-800 bg-stone-900/90 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Учетная запись</h2>

        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#0E1119] border border-stone-800/80 space-y-1">
            <span className="text-[11px] text-stone-400">Email адрес</span>
            <div className="text-sm font-semibold text-white truncate">{user.email}</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E1119] border border-stone-800/80 space-y-1">
            <span className="text-[11px] text-stone-400">Роль в системе</span>
            <div className="text-sm font-bold text-amber-400">
              {user.role === 'ADMIN' ? 'Администратор платформы' : user.role === 'PRO' ? 'Тариф Pro' : 'Тариф Обычный'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E1119] border border-stone-800/80 space-y-1">
            <span className="text-[11px] text-stone-400">Дата регистрации</span>
            <div className="text-sm font-semibold text-stone-200">
              {new Date(user.createdAt).toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>
      </div>

      {/* 2FA / TOTP Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-800 bg-stone-900/90 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-white">Двухфакторная аутентификация (TOTP)</h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Защитите свой аккаунт с помощью одноразовых кодов из приложений (Яндекс Ключ, Google Authenticator)
            </p>
          </div>

          {totpEnabled ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Включена
              </span>
              <button
                onClick={() => {
                  setDisableError(null);
                  setDisablePassword('');
                  setDisableModalOpen(true);
                }}
                className="py-1.5 px-3.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700/60 text-xs font-medium text-stone-300 transition"
              >
                Отключить
              </button>
            </div>
          ) : (
            <button
              onClick={startTotpSetup}
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-xs font-bold uppercase tracking-wider text-white transition shadow-lg shadow-amber-600/25 flex items-center gap-2 active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Настроить 2FA</span>
            </button>
          )}
        </div>
      </div>

      {/* 152-FZ Rights: Export & Delete */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-800 bg-stone-900/90 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-white">Права субъекта персональных данных (152-ФЗ)</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Выгрузка и удаление данных в соответствии со статьями 14 и 21 Федерального закона № 152-ФЗ
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2">
          {/* Data Export */}
          <div className="p-5 rounded-2xl bg-[#0E1119] border border-stone-800/80 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-500" />
                <span>Выгрузка данных (JSON)</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Скачайте полный архив ваших персональных данных (профиль, визитки, контакты, согласия, платежи) в машиночитаемом формате JSON.
              </p>
            </div>

            <a
              href="/api/user/export"
              download
              className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700/60 text-xs font-semibold text-stone-200 hover:text-white transition text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Скачать мои данные</span>
            </a>
          </div>

          {/* Account Deletion */}
          <div className="p-5 rounded-2xl bg-[#0E1119] border border-stone-800/80 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Удаление аккаунта</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Полное удаление вашей учетной записи, снятие с публикации всех визиток и отзыв согласий на обработку ПДн.
              </p>
            </div>

            <button
              onClick={() => {
                setDeleteError(null);
                setDeletePassword('');
                setDeleteModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить аккаунт и данные</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-stone-800 bg-stone-900/95 shadow-2xl relative space-y-5">
            <button
              onClick={() => setSetupModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800 border border-stone-700/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">Настройка двухфакторной аутентификации</h3>
              <p className="text-xs text-stone-400 mt-1">
                Отсканируйте QR-код в приложении аутентификатора (Яндекс Ключ, Google Authenticator)
              </p>
            </div>

            {loadingSetup ? (
              <div className="py-12 flex justify-center text-amber-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-5">
                {qrCodeUrl && (
                  <div className="p-4 bg-white rounded-2xl w-52 h-52 mx-auto flex items-center justify-center shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-full h-full object-contain" />
                  </div>
                )}

                {totpSecret && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-stone-400">Или введите ключ вручную:</span>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0E1119] border border-stone-800 text-xs font-mono text-stone-300">
                      <span className="truncate flex-1 tracking-wider">{totpSecret}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(totpSecret);
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2000);
                        }}
                        className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-white transition"
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleVerifyAndEnable} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      6-значный код из приложения
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      className="w-full text-center text-lg font-mono tracking-widest px-4 py-2.5 rounded-xl bg-[#0E1119] border border-stone-800 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>

                  {setupError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                      {setupError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={verifying || verificationCode.length !== 6}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Подтвердить и включить</span>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2FA Disable Modal */}
      {disableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-stone-800 bg-stone-900/95 shadow-2xl relative space-y-5">
            <button
              onClick={() => setDisableModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800 border border-stone-700/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">Отключение 2FA</h3>
              <p className="text-xs text-stone-400 mt-1">
                Для отключения двухфакторной аутентификации введите текущий пароль от аккаунта
              </p>
            </div>

            <form onSubmit={handleDisable2FA} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Текущий пароль</label>
                <input
                  type="password"
                  required
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0E1119] border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {disableError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {disableError}
                </div>
              )}

              <button
                type="submit"
                disabled={disabling}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {disabling ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Отключить 2FA</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Account Deletion Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-rose-500/30 bg-stone-900/95 shadow-2xl relative space-y-5">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800 border border-stone-700/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Удаление аккаунта</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Это действие необратимо. Все ваши визитки будут сняты с публикации, а персональные данные удалены в соответствии с 152-ФЗ.
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Введите пароль для подтверждения
                </label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0E1119] border border-stone-800 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {deleteError}
                </div>
              )}

              <button
                type="submit"
                disabled={deleting}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Подтверждаю безвозвратное удаление</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
