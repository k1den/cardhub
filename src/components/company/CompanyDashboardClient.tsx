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
  Upload,
  Image as ImageIcon,
  Type,
  Layers,
  Tag,
  Briefcase,
  Phone,
  MessageCircle,
  Share2,
  Globe,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface CompanyData {
  id: string;
  name: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  brandSecondaryColor?: string | null;
  brandFont?: string | null;
  coverUrl?: string | null;
  tagline?: string | null;
  brandPattern?: string | null;
  themeConfig?: any;
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

const BRAND_PALETTES = [
  { name: 'Янтарь & Золото', primary: '#d97706', secondary: '#ea580c' },
  { name: 'Сапфир & Индиго', primary: '#2563eb', secondary: '#4f46e5' },
  { name: 'Изумруд & Мята', primary: '#059669', secondary: '#0d9488' },
  { name: 'Рубин & Бордо', primary: '#dc2626', secondary: '#991b1b' },
  { name: 'Аметист & Пурпур', primary: '#7c3aed', secondary: '#9333ea' },
  { name: 'Графит & Обсидиан', primary: '#475569', secondary: '#0f172a' },
];

const BRAND_PATTERNS = [
  { id: 'smooth', label: 'Гладкий', desc: 'Минималистичный чистый фон' },
  { id: 'dots', label: 'Точки', desc: 'Технологичные микроточки' },
  { id: 'grid', label: 'Сетка', desc: 'Строгая инженерная разметка' },
  { id: 'mesh', label: 'Меш', desc: 'Мягкий градиентный объем' },
  { id: 'carbon', label: 'Карбон', desc: 'Премиальная текстура волокна' },
  { id: 'linen', label: 'Ткань', desc: 'Тактильная фактурная ткань' },
];

const BRAND_FONTS = [
  { id: 'sans', label: 'Современный (Inter / Sans)' },
  { id: 'serif', label: 'Классический (Serif)' },
  { id: 'mono', label: 'Технологичный (Mono)' },
  { id: 'rounded', label: 'Мягкий (Rounded)' },
];

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
  const [createColor, setCreateColor] = useState('#d97706');
  const [createSecondaryColor, setCreateSecondaryColor] = useState('#ea580c');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Extended branding state
  const [brandName, setBrandName] = useState(company?.name || '');
  const [brandWebsite, setBrandWebsite] = useState(company?.website || '');
  const [brandColor, setBrandColor] = useState(company?.brandColor || '#d97706');
  const [brandSecondaryColor, setBrandSecondaryColor] = useState(company?.brandSecondaryColor || '#ea580c');
  const [brandFont, setBrandFont] = useState(company?.brandFont || 'sans');
  const [brandLogo, setBrandLogo] = useState(company?.logoUrl || '');
  const [brandCover, setBrandCover] = useState(company?.coverUrl || '');
  const [brandTagline, setBrandTagline] = useState(company?.tagline || '');
  const [brandPattern, setBrandPattern] = useState(company?.brandPattern || 'smooth');
  const [brandBadgeText, setBrandBadgeText] = useState(
    (company?.themeConfig as any)?.badgeText || 'Корпоративная визитка'
  );
  const [updatingBrand, setUpdatingBrand] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
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
        if (data.success) {
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
          brandSecondaryColor: createSecondaryColor,
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
      setCreateError('Сетевая ошибка при создании компании');
      setCreating(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setBrandError('Размер логотипа не должен превышать 2 МБ');
      return;
    }

    setUploadingLogo(true);
    setBrandError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки логотипа');

      setBrandLogo(data.url);
      setBrandSuccess(false);
    } catch (err: any) {
      setBrandError(err.message || 'Ошибка загрузки логотипа');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setBrandError('Размер обложки не должен превышать 3 МБ');
      return;
    }

    setUploadingCover(true);
    setBrandError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'cover');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки обложки');

      setBrandCover(data.url);
      setBrandSuccess(false);
    } catch (err: any) {
      setBrandError(err.message || 'Ошибка загрузки обложки');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGenerateEmblem = () => {
    const initials = (brandName || 'CH')
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${brandColor}"/>
          <stop offset="100%" stop-color="${brandSecondaryColor}"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="32" fill="url(#bgGrad)"/>
      <circle cx="60" cy="60" r="40" fill="white" fill-opacity="0.15"/>
      <text x="60" y="70" font-size="34" font-family="system-ui, -apple-system, sans-serif" font-weight="900" text-anchor="middle" fill="#ffffff" letter-spacing="1">${initials}</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setBrandLogo(dataUrl);
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
          brandSecondaryColor,
          brandFont,
          logoUrl: brandLogo,
          coverUrl: brandCover,
          tagline: brandTagline,
          brandPattern,
          themeConfig: {
            ...(company.themeConfig as any),
            badgeText: brandBadgeText,
          },
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
      setTimeout(() => setBrandSuccess(false), 4000);
    } catch {
      setBrandError('Ошибка сохранения настроек');
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

      if (res.ok && data.success) {
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
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 shadow-2xl text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden transition-colors">
          {/* Subtle warm amber ambient glow */}
          <div className="ambient-glow bg-amber-600/10 w-72 h-72 -top-16 -left-16 pointer-events-none" />
          <div className="ambient-glow bg-orange-700/10 w-72 h-72 -bottom-16 -right-16 pointer-events-none" />

          <div className="relative z-10 w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/25 text-amber-500 dark:text-amber-400 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/15">
            <Building2 className="w-10 h-10" />
          </div>

          <div className="relative z-10 space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Управление компанией доступно на тарифе Pro
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-lg mx-auto">
              Объединяйте визитки сотрудников, задавайте единый фирменный стиль, экспортируйте базу ссылок для быстрой записи на NFC и контролируйте все действия в журнале аудита.
            </p>
          </div>

          <div className="relative z-10 pt-3">
            <Link
              href="/dashboard/subscription"
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-xl shadow-amber-600/30 inline-flex items-center gap-2.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
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
          <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-amber-500" />
            <span>Создание компании</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Задайте параметры компании и настройте единый корпоративный брендинг
          </p>
        </div>

        <form onSubmit={handleCreateCompany} className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 shadow-xl space-y-5 transition-colors">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Название компании</label>
            <input
              type="text"
              required
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="ООО «Технологии Будущего»"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Корпоративный сайт (необязательно)</label>
            <input
              type="text"
              value={createWebsite}
              onChange={(e) => setCreateWebsite(e.target.value)}
              placeholder="https://company.ru"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Фирменная цветовая пара</label>
            <div className="grid grid-cols-3 gap-2">
              {BRAND_PALETTES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCreateColor(p.primary);
                    setCreateSecondaryColor(p.secondary);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    createColor === p.primary
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0E1119]'
                  }`}
                >
                  <div className="flex -space-x-1 shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: p.primary }} />
                    <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: p.secondary }} />
                  </div>
                  <span className="text-[11px] font-medium text-stone-800 dark:text-stone-200 truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {createError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
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
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden shrink-0"
                style={{ backgroundColor: company.brandColor || '#d97706' }}
              >
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  company.name[0]
                )}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Ваша компания
                </span>
                <h1 className="text-2xl font-black text-stone-900 dark:text-white">{company.name}</h1>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Вы состоите в качестве сотрудника
                </p>
              </div>
            </div>

            <button
              onClick={handleLeaveCompany}
              disabled={leaving}
              className="py-2 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
            >
              {leaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              <span>Покинуть компанию</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 leading-relaxed space-y-2">
            <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Управление вашей визиткой</span>
            </div>
            <p>
              Администратор компании может редактировать контактные данные вашей визитки и применять корпоративный стиль. Если вы покинете компанию, ваша визитка останется в вашем аккаунте, но связь с компанией снимется.
            </p>
          </div>
        </div>

        {/* Audit log for employee's card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 shadow-xl space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Журнал действий администратора</span>
            </h2>
            <button
              onClick={() => handleTabChange('audit')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
            >
              {loadingAudit ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">Действий пока не зафиксировано</p>
          ) : (
            <div className="space-y-2 pt-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-white">{log.action}</span>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {log.actor?.email || 'Администратор'}
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-stone-500">
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 shadow-xl relative overflow-hidden space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden shrink-0 border border-black/10 dark:border-white/10"
              style={{ backgroundColor: brandColor || '#d97706' }}
            >
              {brandLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brandLogo} alt={brandName} className="w-full h-full object-cover" />
              ) : (
                brandName[0] || 'C'
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  Корпоративный Pro
                </span>
                {brandTagline && (
                  <span className="text-xs text-stone-500 italic hidden sm:inline">«{brandTagline}»</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white mt-1">{brandName}</h1>
              {brandWebsite && (
                <a
                  href={brandWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white inline-flex items-center gap-1 mt-0.5"
                >
                  <span>{brandWebsite.replace(/^https?:\/\//, '')}</span>
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
              className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 transition flex items-center justify-center gap-2 shadow-sm"
              title="Скачать CSV со всеми ссылками визиток (?s=nfc) для массовой записи меток"
            >
              <Download className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Экспорт ссылок NFC (CSV)</span>
            </a>

            <button
              onClick={() => {
                setGeneratedInviteUrl(null);
                setInviteModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Пригласить сотрудника</span>
            </button>
          </div>
        </div>

        {/* Slot Progress */}
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>Слотов занято: <strong className="text-stone-900 dark:text-white">{activeMembers.length} из {maxSlots}</strong></span>
          <span>Осталось доступных мест: {Math.max(0, maxSlots - activeMembers.length)}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
        <button
          onClick={() => handleTabChange('members')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'members'
              ? 'border-amber-500 text-stone-900 dark:text-white'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Сотрудники и визитки ({company.cards.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('branding')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'branding'
              ? 'border-amber-500 text-stone-900 dark:text-white'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Брендинг и стиль компании</span>
        </button>

        <button
          onClick={() => handleTabChange('invitations')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'invitations'
              ? 'border-amber-500 text-stone-900 dark:text-white'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Приглашения ({company.invitations.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('audit')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'audit'
              ? 'border-amber-500 text-stone-900 dark:text-white'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
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
            <div className="glass-panel p-8 text-center text-xs text-stone-500 rounded-3xl border border-stone-200 dark:border-stone-800">
              Пока нет визиток сотрудников. Отправьте приглашение, чтобы добавить сотрудника.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.cards.map((card) => {
                const isEmployee = card.ownerId !== userId;

                return (
                  <div
                    key={card.id}
                    className="glass-card p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 space-y-4 relative flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-stone-900 dark:text-white text-sm">{card.fullName}</h3>
                          {card.position && (
                            <p className="text-xs text-stone-500 dark:text-stone-400">{card.position}</p>
                          )}
                          <div className="text-[11px] text-stone-400 mt-0.5">{card.owner.email}</div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            card.published
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-300 dark:border-stone-700'
                          }`}
                        >
                          {card.published ? 'Активна' : 'Черновик'}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-[11px] font-mono text-stone-700 dark:text-stone-300 flex items-center justify-between">
                        <span className="truncate">/c/{card.slug}</span>
                        <Link href={`/c/${card.slug}`} target="_blank" className="text-amber-600 dark:text-amber-400 hover:underline ml-1">
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200 dark:border-stone-800/80 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCard(card);
                          setCardName(card.fullName);
                          setCardPosition(card.position || '');
                          setCardPublished(card.published);
                        }}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-white text-xs font-medium transition text-center"
                      >
                        Редактировать
                      </button>

                      {isEmployee && (
                        <button
                          onClick={() => handleRemoveMember(card.ownerId)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition"
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

      {/* Tab: Extended Corporate Branding & Real-Time Card Preview */}
      {activeTab === 'branding' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <form onSubmit={handleUpdateBranding} className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/90 shadow-xl space-y-6 transition-colors">
            {/* Section 1: Core Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>Основная информация о бренде</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Название компании *</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Корпоративный сайт</label>
                  <input
                    type="text"
                    value={brandWebsite}
                    onChange={(e) => setBrandWebsite(e.target.value)}
                    placeholder="https://company.ru"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Слоган / Девиз компании</label>
                  <input
                    type="text"
                    value={brandTagline}
                    onChange={(e) => setBrandTagline(e.target.value)}
                    placeholder="Например: Надежность и инновации"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Logo Selection & Upload */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>Логотип компании</span>
                </span>
                {brandLogo && (
                  <button
                    type="button"
                    onClick={() => setBrandLogo('')}
                    className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                  >
                    Удалить логотип
                  </button>
                )}
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center border border-stone-300 dark:border-stone-700 overflow-hidden shadow-inner shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  {brandLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brandLogo} alt="Logo" className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <span className="text-white text-2xl font-black">{brandName[0] || 'C'}</span>
                  )}
                </div>

                <div className="space-y-2 flex-1 w-full text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer transition shadow-sm flex items-center gap-1.5 active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingLogo ? 'Загрузка...' : 'Загрузить файл (до 2 МБ)'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleGenerateEmblem}
                      className="py-2 px-3.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Сгенерировать эмблему</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={brandLogo}
                    onChange={(e) => setBrandLogo(e.target.value)}
                    placeholder="Или укажите прямую ссылку на логотип: https://..."
                    className="w-full px-3.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-300 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Dual Color Palettes */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-500" />
                <span>Фирменные цвета (Основной + Дополнительный)</span>
              </h3>

              {/* Ready-made Palettes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BRAND_PALETTES.map((pal, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBrandColor(pal.primary);
                      setBrandSecondaryColor(pal.secondary);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      brandColor === pal.primary && brandSecondaryColor === pal.secondary
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0E1119] hover:border-stone-400 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex -space-x-1.5 shrink-0">
                      <span className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: pal.primary }} />
                      <span className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: pal.secondary }} />
                    </div>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">{pal.name}</span>
                  </button>
                ))}
              </div>

              {/* Manual Color Pickers */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Основной фирменный цвет</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-xs font-mono text-stone-800 dark:text-stone-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Второй акцентный цвет</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandSecondaryColor}
                      onChange={(e) => setBrandSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={brandSecondaryColor}
                      onChange={(e) => setBrandSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-xs font-mono text-stone-800 dark:text-stone-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Corporate Header Cover / Banner */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>Обложка / Корпоративный баннер для визиток</span>
                </span>
                {brandCover && (
                  <button
                    type="button"
                    onClick={() => setBrandCover('')}
                    className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                  >
                    Удалить обложку
                  </button>
                )}
              </h3>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 space-y-3">
                {brandCover ? (
                  <div className="relative h-28 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={brandCover} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="h-24 rounded-xl flex items-center justify-center text-xs text-white/80 font-medium shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${brandColor} 0%, ${brandSecondaryColor} 100%)`,
                    }}
                  >
                    <span>Стандартный корпоративный градиент</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto py-2 px-3.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-95">
                    <Upload className="w-3.5 h-3.5 text-amber-500" />
                    <span>{uploadingCover ? 'Загрузка...' : 'Загрузить баннер (до 3 МБ)'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                    />
                  </label>

                  <input
                    type="text"
                    value={brandCover}
                    onChange={(e) => setBrandCover(e.target.value)}
                    placeholder="Или URL баннера: https://..."
                    className="flex-1 w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-300 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Font, Pattern & Corporate Badge */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Типографика, текстура фона и бейдж</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Корпоративный шрифт</label>
                  <select
                    value={brandFont}
                    onChange={(e) => setBrandFont(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-500 transition"
                  >
                    {BRAND_FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Текстура фона визиток</label>
                  <select
                    value={brandPattern}
                    onChange={(e) => setBrandPattern(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-500 transition"
                  >
                    {BRAND_PATTERNS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} — {p.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Текст верификационного бейджа сотрудника</label>
                <input
                  type="text"
                  value={brandBadgeText}
                  onChange={(e) => setBrandBadgeText(e.target.value)}
                  placeholder="Корпоративная визитка"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {brandError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{brandError}</span>
              </div>
            )}

            {brandSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Фирменный стиль компании успешно сохранен и применен ко всем визиткам!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={updatingBrand}
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {updatingBrand ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Сохранить настройки брендинга</span>}
            </button>
          </form>

          {/* Right Column: Live Real-Time Interactive Card Preview */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                <span>Живой предпросмотр визитки</span>
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Обновляется на лету</span>
            </div>

            {/* Mockup Card Frame */}
            <div
              className={`rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121620] shadow-2xl overflow-hidden transition-all duration-300 ${
                brandFont === 'serif'
                  ? 'font-serif'
                  : brandFont === 'mono'
                  ? 'font-mono'
                  : brandFont === 'rounded'
                  ? 'font-sans tracking-wide'
                  : 'font-sans'
              } ${
                brandPattern === 'dots'
                  ? 'texture-dots'
                  : brandPattern === 'grid'
                  ? 'texture-grid'
                  : brandPattern === 'mesh'
                  ? 'texture-mesh'
                  : brandPattern === 'carbon'
                  ? 'texture-carbon'
                  : brandPattern === 'linen'
                  ? 'texture-linen'
                  : ''
              }`}
            >
              {/* Header Cover Banner */}
              <div
                className="h-32 w-full relative overflow-hidden transition-all"
                style={{
                  background: brandCover
                    ? `url(${brandCover}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${brandColor}50 0%, ${brandSecondaryColor}30 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Card Profile Section */}
              <div className="px-5 pb-6 -mt-12 relative space-y-4">
                {/* Avatar and logo badge row */}
                <div className="flex items-end justify-between">
                  <div
                    className="w-20 h-20 rounded-2xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-xl font-bold shadow-xl border-4"
                    style={{ borderColor: brandColor }}
                  >
                    <span className="text-stone-700 dark:text-white">АС</span>
                  </div>

                  {brandLogo && (
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-1 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={brandLogo} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Identity */}
                <div className="space-y-1">
                  <div className="pt-0.5">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-xs"
                      style={{
                        backgroundColor: `${brandColor}18`,
                        borderColor: `${brandColor}40`,
                        color: brandColor,
                      }}
                    >
                      <Briefcase className="w-2.5 h-2.5" />
                      <span>{brandBadgeText || 'Корпоративная визитка'}</span>
                    </span>
                  </div>

                  <h4 className="text-xl font-black text-stone-900 dark:text-white">Алексей Смирнов</h4>
                  <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: brandColor }}>
                    <span>Ведущий специалист</span>
                    <span>•</span>
                    <span>{brandName || 'Компания'}</span>
                  </div>

                  {brandTagline && (
                    <p className="text-[11px] text-stone-500 italic pt-0.5">«{brandTagline}»</p>
                  )}
                </div>

                {/* Quick actions buttons in brand style */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div
                    className="py-2 rounded-xl text-white text-[11px] font-semibold text-center shadow-sm flex items-center justify-center gap-1"
                    style={{ backgroundColor: brandColor }}
                  >
                    <Phone className="w-3 h-3" />
                    <span>Позвонить</span>
                  </div>
                  <div
                    className="py-2 rounded-xl text-white text-[11px] font-semibold text-center shadow-sm flex items-center justify-center gap-1"
                    style={{ backgroundColor: brandSecondaryColor }}
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Написать</span>
                  </div>
                  <div className="py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] font-semibold text-center border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1">
                    <Share2 className="w-3 h-3 text-amber-500" />
                    <span>Контакт</span>
                  </div>
                </div>

                {/* Footer preview note */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800/80 text-[10px] text-stone-400 text-center">
                  Все визитки сотрудников автоматически получат этот стиль
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Invitations */}
      {activeTab === 'invitations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">Активные приглашения</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Срок действия ссылки приглашения составляет 7 дней (согласно разделу 4.5 ТЗ)
              </p>
            </div>

            <button
              onClick={() => {
                setGeneratedInviteUrl(null);
                setInviteModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition shadow-md shadow-amber-600/20 flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать приглашение</span>
            </button>
          </div>

          {company.invitations.length === 0 ? (
            <div className="glass-panel p-8 text-center text-xs text-stone-500 rounded-3xl border border-stone-200 dark:border-stone-800">
              Нет активных приглашений
            </div>
          ) : (
            <div className="overflow-x-auto glass-panel rounded-3xl border border-stone-200 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                  <tr>
                    <th className="p-4 font-semibold">Email сотрудника</th>
                    <th className="p-4 font-semibold">Создано</th>
                    <th className="p-4 font-semibold">Истекает</th>
                    <th className="p-4 font-semibold text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800/60 text-stone-700 dark:text-stone-300">
                  {company.invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-50 dark:hover:bg-stone-900/40">
                      <td className="p-4 font-medium text-stone-900 dark:text-white">{inv.email}</td>
                      <td className="p-4 font-mono text-stone-500 dark:text-stone-400">
                        {new Date(inv.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4 font-mono text-amber-600 dark:text-amber-400">
                        {new Date(inv.expiresAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleCancelInvite(inv.id)}
                          className="text-xs text-rose-500 hover:underline transition"
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
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 shadow-xl space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Неизменяемый журнал аудита компании (Section 4.5 & 8)</span>
            </h2>
            <button
              onClick={() => handleTabChange('audit')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline transition font-medium"
            >
              {loadingAudit ? 'Обновление...' : 'Обновить'}
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-500">
              В журнале пока нет записей
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-stone-900 dark:text-white">{log.action}</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Инициатор: <span className="text-stone-800 dark:text-stone-200">{log.actor?.email || 'Система'}</span> • Объект: {log.targetType}
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-stone-500 sm:text-right">
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
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/95 shadow-2xl relative space-y-5">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-500" />
                <span>Пригласить сотрудника</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Сотрудник получит ссылку с обязательным согласием 152-ФЗ на присоединение к компании
              </p>
            </div>

            {generatedInviteUrl ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 space-y-2">
                  <p className="font-semibold">Приглашение создано (действительно 7 дней):</p>
                  <div className="p-2 rounded-xl bg-white dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 font-mono text-[11px] break-all select-all text-stone-900 dark:text-white">
                    {generatedInviteUrl}
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedInviteUrl);
                    setCopiedInvite(true);
                    setTimeout(() => setCopiedInvite(false), 2000);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  {copiedInvite ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedInvite ? 'Ссылка скопирована' : 'Скопировать ссылку'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Email сотрудника</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="employee@company.ru"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {inviteError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                    {inviteError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
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
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/95 shadow-2xl relative space-y-5">
            <button
              onClick={() => setEditingCard(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">Редактирование данных сотрудника</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Все изменения фиксируются в журнале аудита согласно разделу 4.5 ТЗ
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">ФИО сотрудника</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Должность в компании</label>
                <input
                  type="text"
                  value={cardPosition}
                  onChange={(e) => setCardPosition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1119] border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="publishedToggle"
                  checked={cardPublished}
                  onChange={(e) => setCardPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="publishedToggle" className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                  Визитка опубликована и доступна по NFC / ссылке
                </label>
              </div>

              <button
                onClick={handleSaveEmployeeCard}
                disabled={savingCard}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingCard ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Сохранить изменения</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
