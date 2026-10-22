'use client';

import React, { useState } from 'react';
import {
  Building2,
  Users,
  Palette,
  Mail,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Sparkles,
  Calendar,
  Eye,
  LogOut,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface CompanyData {
  id: string;
  name: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  brandFont?: string | null;
  website?: string | null;
  slug?: string | null;
  memberships: Array<{
    id: string;
    userId: string;
    role: 'OWNER' | 'MEMBER';
    status: 'ACTIVE' | 'INVITED';
    user: {
      id: string;
      email: string;
      role: string;
    };
  }>;
  cards: Array<{
    id: string;
    slug: string;
    fullName: string;
    position?: string | null;
    published: boolean;
    ownerId: string;
    owner: {
      id: string;
      email: string;
    };
  }>;
  invitations: Array<{
    id: string;
    email: string;
    expiresAt: string;
    createdAt: string;
  }>;
}

interface CompanyDashboardClientProps {
  initialCompany: CompanyData | null;
  isOwner: boolean;
  isMember: boolean;
  isPro: boolean;
  userId: string;
}

export default function CompanyDashboardClient({
  initialCompany,
  isOwner,
  isMember,
  isPro,
  userId,
}: CompanyDashboardClientProps) {
  const [company, setCompany] = useState<CompanyData | null>(initialCompany);
  const [activeTab, setActiveTab] = useState<'members' | 'branding' | 'invitations' | 'audit'>('members');

  // Creation form state
  const [createName, setCreateName] = useState('');
  const [createWebsite, setCreateWebsite] = useState('');
  const [createColor, setCreateColor] = useState('#3b82f6');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Branding update state
  const [brandName, setBrandName] = useState(company?.name || '');
  const [brandWebsite, setBrandWebsite] = useState(company?.website || '');
  const [brandColor, setBrandColor] = useState(company?.brandColor || '#3b82f6');
  const [brandLogo, setBrandLogo] = useState(company?.logoUrl || '');
  const [updatingBrand, setUpdatingBrand] = useState(false);
  const [brandSuccess, setBrandSuccess] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);

  // Edit employee card modal
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [cardName, setCardName] = useState('');
  const [cardPosition, setCardPosition] = useState('');
  const [cardPublished, setCardPublished] = useState(true);
  const [savingCard, setSavingCard] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Leaving company state
  const [leaving, setLeaving] = useState(false);

  // Load audit logs when tab is clicked
  const handleTabChange = async (tab: 'members' | 'branding' | 'invitations' | 'audit') => {
    setActiveTab(tab);
    if (tab === 'audit' && company) {
      setLoadingAudit(true);
      try {
        const res = await fetch(`/api/company/audit?companyId=${company.id}`);
        const data = await res.json();
        if (data.logs) {
          setAuditLogs(data.logs);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoadingAudit(false);
      }
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);

    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName,
          website: createWebsite,
          brandColor: createColor,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || 'Ошибка при создании компании');
        setCreating(false);
        return;
      }

      window.location.reload();
    } catch {
      setCreateError('Не удалось создать компанию. Попробуйте позже.');
      setCreating(false);
    }
  };

  const handleUpdateBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setBrandError(null);
    setBrandSuccess(false);
    setUpdatingBrand(true);

    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          name: brandName,
          website: brandWebsite,
          brandColor,
          logoUrl: brandLogo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBrandError(data.error || 'Ошибка при сохранении брендинга');
        setUpdatingBrand(false);
        return;
      }

      setBrandSuccess(true);
      setCompany((prev) => (prev ? { ...prev, ...data.company } : null));
      setTimeout(() => setBrandSuccess(false), 3000);
    } catch {
      setBrandError('Ошибка сохранения');
    } finally {
      setUpdatingBrand(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setInviteError(null);
    setInviting(true);

    try {
      const res = await fetch('/api/company/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          email: inviteEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error || 'Ошибка отправки приглашения');
        setInviting(false);
        return;
      }

      setGeneratedInviteUrl(data.inviteUrl);
      setCompany((prev) =>
        prev
          ? {
              ...prev,
              invitations: [data.invitation, ...prev.invitations],
            }
          : null
      );
      setInviteEmail('');
    } catch {
      setInviteError('Сетевая ошибка');
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!company) return;
    try {
      await fetch(`/api/company/invitations/${inviteId}?companyId=${company.id}`, {
        method: 'DELETE',
      });
      setCompany((prev) =>
        prev
          ? {
              ...prev,
              invitations: prev.invitations.filter((inv) => inv.id !== inviteId),
            }
          : null
      );
    } catch (err) {
      console.error('Failed to cancel invite:', err);
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    if (!company) return;
    if (!confirm('Вы уверены, что хотите исключить этого сотрудника из компании? Его визитка останется у него, но брендинг компании будет снят.')) {
      return;
    }

    try {
      const res = await fetch(`/api/company/members/${memberUserId}?companyId=${company.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCompany((prev) =>
          prev
            ? {
                ...prev,
                memberships: prev.memberships.filter((m) => m.userId !== memberUserId),
                cards: prev.cards.filter((c) => c.ownerId !== memberUserId),
              }
            : null
        );
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleSaveEmployeeCard = async () => {
    if (!editingCard || !company) return;
    setSavingCard(true);

    try {
      const res = await fetch(`/api/company/cards/${editingCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          fullName: cardName,
          position: cardPosition,
          published: cardPublished,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCompany((prev) =>
          prev
            ? {
                ...prev,
                cards: prev.cards.map((c) => (c.id === editingCard.id ? { ...c, ...data.card } : c)),
              }
            : null
        );
        setEditingCard(null);
      }
    } catch (err) {
      console.error('Failed to save card:', err);
    } finally {
      setSavingCard(false);
    }
  };

  const handleLeaveCompany = async () => {
    if (!confirm('Вы действительно хотите покинуть компанию? Ваша визитка останется у вас, но корпоративный брендинг будет снят.')) {
      return;
    }

    setLeaving(true);
    try {
      const res = await fetch('/api/company/leave', { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to leave company:', err);
      setLeaving(false);
    }
  };

  // --- 1. No company view ---
  if (!company) {
    if (!isPro) {
      return (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Управление компанией доступно на тарифе Pro</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Объединяйте визитки сотрудников, задавайте единый фирменный стиль, экспортируйте базу ссылок для быстрой записи на NFC и контролируйте все действия в журнале аудита.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/subscription"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Перейти на тариф Pro</span>
            </Link>
          </div>
        </div>
      );
    }

    // Pro user creating first company
    return (
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <span>Создание компании</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Задайте параметры компании и настройте единый корпоративный брендинг
          </p>
        </div>

        <form onSubmit={handleCreateCompany} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Название компании <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Например, ООО «Технологии Будущего»"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Сайт компании</label>
            <input
              type="text"
              value={createWebsite}
              onChange={(e) => setCreateWebsite(e.target.value)}
              placeholder="https://company.ru"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Основной фирменный цвет</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={createColor}
                onChange={(e) => setCreateColor(e.target.value)}
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={createColor}
                onChange={(e) => setCreateColor(e.target.value)}
                className="w-32 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {createError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Создать компанию</span>}
          </button>
        </form>
      </div>
    );
  }

  // --- 2. Employee View (Member of company) ---
  if (!isOwner && isMember) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md"
                style={{ backgroundColor: company.brandColor || '#3b82f6' }}
              >
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  company.name[0]
                )}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ваша компания
                </span>
                <h1 className="text-2xl font-black text-white">{company.name}</h1>
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Вы состоите в качестве сотрудника
                </p>
              </div>
            </div>

            <button
              onClick={handleLeaveCompany}
              disabled={leaving}
              className="py-2 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
            >
              {leaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              <span>Покинуть компанию</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Управление вашей визиткой</span>
            </div>
            <p>
              Администратор компании может редактировать контактные данные вашей визитки и применять корпоративный стиль. Если вы покинете компанию, ваша визитка останется в вашем аккаунте, но связь с компанией снимется.
            </p>
          </div>
        </div>

        {/* Audit log for employee's card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Журнал действий администратора над вашей визиткой</span>
          </h2>

          <button
            onClick={() => handleTabChange('audit')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            {loadingAudit ? 'Загрузка...' : 'Обновить журнал аудита'}
          </button>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Действий пока не зафиксировано</p>
          ) : (
            <div className="space-y-2 pt-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">{log.action}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {log.actor?.email || 'Администратор'}
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {new Date(log.createdAt).toLocaleString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 3. Company Admin / Owner View ---
  const activeMembers = company.memberships.filter((m) => m.status === 'ACTIVE');
  const maxSlots = 10;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden shrink-0"
              style={{ backgroundColor: company.brandColor || '#3b82f6' }}
            >
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                company.name[0]
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Корпоративный Pro
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{company.name}</h1>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 mt-0.5"
                >
                  <span>{company.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Actions & Slots */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <a
              href={`/api/company/export-nfc?companyId=${company.id}`}
              download
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center justify-center gap-2 shadow-sm"
              title="Скачать CSV со всеми ссылками визиток (?s=nfc) для массовой записи меток"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Экспорт ссылок NFC (CSV)</span>
            </a>

            <button
              onClick={() => {
                setGeneratedInviteUrl(null);
                setInviteModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Пригласить сотрудника</span>
            </button>
          </div>
        </div>

        {/* Slot Progress */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Слотов занято: <strong className="text-white">{activeMembers.length} из {maxSlots}</strong></span>
          <span>Осталось доступных мест: {Math.max(0, maxSlots - activeMembers.length)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800 gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
        <button
          onClick={() => handleTabChange('members')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'members'
              ? 'border-amber-500 text-white'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Сотрудники и визитки ({company.cards.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('branding')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'branding'
              ? 'border-amber-500 text-white'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Брендинг и стиль</span>
        </button>

        <button
          onClick={() => handleTabChange('invitations')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'invitations'
              ? 'border-amber-500 text-white'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Приглашения ({company.invitations.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('audit')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'audit'
              ? 'border-amber-500 text-white'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Журнал аудита</span>
        </button>
      </div>

      {/* Tab: Members & Cards */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {company.cards.length === 0 ? (
            <div className="glass-panel p-8 text-center text-xs text-slate-500 rounded-3xl">
              Пока нет визиток сотрудников. Отправьте приглашение, чтобы добавить сотрудника.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.cards.map((card) => {
                const isEmployee = card.ownerId !== userId;

                return (
                  <div
                    key={card.id}
                    className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 relative flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white text-sm">{card.fullName}</h3>
                          {card.position && (
                            <p className="text-xs text-slate-400">{card.position}</p>
                          )}
                          <div className="text-[11px] text-slate-500 mt-0.5">{card.owner.email}</div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            card.published
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {card.published ? 'Активна' : 'Черновик'}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                        <span className="truncate">/c/{card.slug}</span>
                        <Link href={`/c/${card.slug}`} target="_blank" className="text-blue-400 hover:text-blue-300 ml-1">
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCard(card);
                          setCardName(card.fullName);
                          setCardPosition(card.position || '');
                          setCardPublished(card.published);
                        }}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition text-center"
                      >
                        Редактировать
                      </button>

                      {isEmployee && (
                        <button
                          onClick={() => handleRemoveMember(card.ownerId)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                          title="Исключить сотрудника из компании"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Branding & Style */}
      {activeTab === 'branding' && (
        <form onSubmit={handleUpdateBranding} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-2xl space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Название компании</label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Корпоративный сайт</label>
            <input
              type="text"
              value={brandWebsite}
              onChange={(e) => setBrandWebsite(e.target.value)}
              placeholder="https://company.ru"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Ссылка на логотип (URL)</label>
            <input
              type="text"
              value={brandLogo}
              onChange={(e) => setBrandLogo(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Фирменный цвет</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-32 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {brandError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {brandError}
            </div>
          )}

          {brandSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Настройки брендинга успешно сохранены</span>
            </div>
          )}

          <button
            type="submit"
            disabled={updatingBrand}
            className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-blue-600/25 flex items-center gap-2 disabled:opacity-50"
          >
            {updatingBrand ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Сохранить изменения</span>}
          </button>
        </form>
      )}

      {/* Tab: Invitations */}
      {activeTab === 'invitations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white">Активные приглашения</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Срок действия ссылки приглашения составляет 7 дней (согласно разделу 4.5 ТЗ)
              </p>
            </div>

            <button
              onClick={() => {
                setGeneratedInviteUrl(null);
                setInviteModalOpen(true);
              }}
              className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать приглашение</span>
            </button>
          </div>

          {company.invitations.length === 0 ? (
            <div className="glass-panel p-8 text-center text-xs text-slate-500 rounded-3xl">
              Нет активных приглашений
            </div>
          ) : (
            <div className="overflow-x-auto glass-panel rounded-3xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 font-semibold">Email сотрудника</th>
                    <th className="p-4 font-semibold">Создано</th>
                    <th className="p-4 font-semibold">Истекает</th>
                    <th className="p-4 font-semibold text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {company.invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/40">
                      <td className="p-4 font-medium text-white">{inv.email}</td>
                      <td className="p-4 font-mono text-slate-400">
                        {new Date(inv.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4 font-mono text-amber-400">
                        {new Date(inv.expiresAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleCancelInvite(inv.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 transition"
                        >
                          Отозвать
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Неизменяемый журнал аудита компании (Section 4.5 & 8)</span>
            </h2>
            <button
              onClick={() => handleTabChange('audit')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {loadingAudit ? 'Обновление...' : 'Обновить'}
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              В журнале пока нет записей
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{log.action}</div>
                    <div className="text-[11px] text-slate-400">
                      Инициатор: <span className="text-slate-200">{log.actor?.email || 'Система'}</span> • Объект: {log.targetType}
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 sm:text-right">
                    {new Date(log.createdAt).toLocaleString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative space-y-5">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">Пригласить сотрудника</h3>
              <p className="text-xs text-slate-400 mt-1">
                Срок действия ссылки — 7 дней. Сотрудник получит экран обязательного согласия по 152-ФЗ.
              </p>
            </div>

            {generatedInviteUrl ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  Приглашение создано! Скопируйте ссылку и передайте сотруднику:
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                  <span className="truncate flex-1">{generatedInviteUrl}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedInviteUrl);
                      setCopiedInvite(true);
                      setTimeout(() => setCopiedInvite(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition shrink-0"
                  >
                    {copiedInvite ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => setInviteModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email сотрудника</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {inviteError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {inviteError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Создать ссылку приглашения</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Employee Card Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative space-y-5">
            <button
              onClick={() => setEditingCard(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">Редактирование визитки</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Действие будет записано в журнал аудита визитки сотрудника
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Имя и фамилия</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Должность</label>
                <input
                  type="text"
                  value={cardPosition}
                  onChange={(e) => setCardPosition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="cardPub"
                  checked={cardPublished}
                  onChange={(e) => setCardPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 cursor-pointer"
                />
                <label htmlFor="cardPub" className="text-xs text-slate-300 cursor-pointer">
                  Визитка опубликована (доступна по ссылке)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSaveEmployeeCard}
                  disabled={savingCard}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  {savingCard ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Сохранить</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
