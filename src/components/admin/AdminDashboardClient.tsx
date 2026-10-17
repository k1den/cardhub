'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Flag,
  FileText,
  CreditCard,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Search,
  RefreshCw,
  Loader2,
  Ban,
  Check,
  Eye,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface Metrics {
  totalUsers: number;
  verifiedUsers: number;
  totalCards: number;
  publishedCards: number;
  totalCompanies: number;
  activeSubscriptions: number;
  pendingReports: number;
  totalRevenueRub: number;
}

interface ReportItem {
  id: string;
  reason: string;
  details: string | null;
  reporterIp: string | null;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  resolvedAt: string | null;
  card: {
    id: string;
    slug: string;
    title: string | null;
    fullName: string;
    published: boolean;
    owner: {
      id: string;
      email: string;
      role: string;
      deletedAt: string | null;
    };
    company?: {
      id: string;
      name: string;
    } | null;
  };
}

interface UserItem {
  id: string;
  email: string;
  role: 'USER' | 'PRO' | 'ADMIN';
  emailVerified: boolean;
  totpEnabled: boolean;
  createdAt: string;
  deletedAt: string | null;
  _count: {
    cards: number;
    memberships: number;
  };
  subscriptions: Array<{
    plan: string;
    status: string;
    currentPeriodEnd: string;
  }>;
}

interface AuditItem {
  id: string;
  targetType: string;
  targetId: string;
  action: string;
  details: any;
  ipAddress: string | null;
  createdAt: string;
  actor: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export default function AdminDashboardClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users' | 'audit'>(
    tabParam as any
  );

  useEffect(() => {
    if (tabParam && ['overview', 'reports', 'users', 'audit'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const switchTab = (tab: 'overview' | 'reports' | 'users' | 'audit') => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`);
  };

  // State
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditItem[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Reports
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsFilter, setReportsFilter] = useState<'PENDING' | 'RESOLVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportActionLoading, setReportActionLoading] = useState<string | null>(null);

  // Users
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Overview Data
  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setRecentLogs(data.recentAuditLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOverview(false);
    }
  };

  // Load Reports
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${reportsFilter}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReports(false);
    }
  };

  // Load Users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (userRoleFilter !== 'ALL') params.set('role', userRoleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load Audit
  const loadAudit = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch('/api/admin/audit?limit=50');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'audit') loadAudit();
  }, [activeTab, reportsFilter, userRoleFilter]);

  // Handle Report Action
  const handleReportAction = async (
    reportId: string,
    action: 'APPROVE_HIDE_CARD' | 'REJECT' | 'BAN_AUTHOR'
  ) => {
    const confirmText =
      action === 'BAN_AUTHOR'
        ? 'Вы уверены, что хотите заблокировать автора, скрыть все его визитки и завершить сессии?'
        : action === 'APPROVE_HIDE_CARD'
        ? 'Скрыть визитку и удовлетворить жалобу?'
        : 'Отклонить жалобу? Визитка останется в общем доступе.';

    if (!window.confirm(confirmText)) return;

    setReportActionLoading(reportId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || 'Действие успешно выполнено');
        loadReports();
        loadOverview();
      } else {
        setErrorMsg(data.error || 'Ошибка при модерации жалобы');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Ошибка сети');
    } finally {
      setReportActionLoading(null);
    }
  };

  // Handle User Role Change
  const handleRoleChange = async (userId: string, newRole: 'USER' | 'PRO' | 'ADMIN') => {
    setUserActionLoading(userId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'CHANGE_ROLE', role: newRole }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message);
        loadUsers();
      } else {
        setErrorMsg(data.error);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Ошибка сети');
    } finally {
      setUserActionLoading(null);
    }
  };

  // Handle Block / Unblock User
  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    const confirmText = isBlocked
      ? 'Разблокировать пользователя?'
      : 'Заблокировать пользователя? Все его сессии будут удалены, а визитки скрыты.';

    if (!window.confirm(confirmText)) return;

    setUserActionLoading(userId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'TOGGLE_BLOCK' }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message);
        loadUsers();
        loadOverview();
      } else {
        setErrorMsg(data.error);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Ошибка сети');
    } finally {
      setUserActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => switchTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Обзор платформы</span>
          </button>

          <button
            onClick={() => switchTab('reports')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 shrink-0 relative ${
              activeTab === 'reports'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Модерация 149-ФЗ</span>
            {metrics && metrics.pendingReports > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black">
                {metrics.pendingReports}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Пользователи</span>
          </button>

          <button
            onClick={() => switchTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'audit'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Журнал аудита</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'overview') loadOverview();
            if (activeTab === 'reports') loadReports();
            if (activeTab === 'users') loadUsers();
            if (activeTab === 'audit') loadAudit();
          }}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
          title="Обновить данные"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loadingOverview ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Пользователи</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{metrics?.totalUsers ?? 0}</div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {metrics?.verifiedUsers ?? 0} подтвержденных email
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Цифровые визитки</span>
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{metrics?.totalCards ?? 0}</div>
                  <div className="text-[11px] text-blue-400 mt-1">
                    {metrics?.publishedCards ?? 0} опубликовано
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Pro подписки & Доход</span>
                    <Building2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {metrics?.activeSubscriptions ?? 0}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {metrics?.totalRevenueRub?.toLocaleString('ru-RU') ?? 0} ₽ выручка
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-red-500/20 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-red-300">Очередь жалоб (149-ФЗ)</span>
                    <Flag className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl font-black text-red-400">
                    {metrics?.pendingReports ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {metrics?.pendingReports === 0 ? 'Все жалобы обработаны' : 'Требуют модерации'}
                  </div>
                </div>
              </div>

              {/* Compliance & Quick Action Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-amber-500/20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-bold text-white text-sm">
                        Статус соответствия законодательству РФ
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 max-w-2xl">
                      Платформа работает в строгом соответствии с <strong>152-ФЗ</strong> (согласия, экспорт и удаление), 
                      <strong> 242-ФЗ</strong> (локализация баз данных в РФ, отсутствие внешних CDN/шрифтов), 
                      <strong> 54-ФЗ</strong> (онлайн-фискализация ЮKassa) и <strong>149-ФЗ</strong> (модерация запрещенного контента).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => switchTab('reports')}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
                    >
                      Модерация жалоб
                    </button>
                    <button
                      onClick={() => switchTab('users')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      Пользователи
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Audit Logs Snapshot */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Свежие события аудита платформы</span>
                  </h3>
                  <button
                    onClick={() => switchTab('audit')}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Посмотреть все &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {recentLogs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      Событий аудита пока нет
                    </div>
                  ) : (
                    recentLogs.map((log) => (
                      <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                              {log.action}
                            </span>
                            <span className="text-slate-400">
                              {log.actor?.email || 'Система'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Цель: {log.targetType} ({log.targetId})
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          {new Date(log.createdAt).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: 149-FZ REPORTS MODERATION */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-400" />
                <span>Очередь модерации контента (149-ФЗ «Об информации...»)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Жалобы пользователей на визитки с признаками нарушения законов РФ или правил сервиса
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['PENDING', 'RESOLVED', 'REJECTED', 'ALL'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setReportsFilter(status)}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    reportsFilter === status
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status === 'PENDING' && 'В ожидании'}
                  {status === 'RESOLVED' && 'Удовлетворены'}
                  {status === 'REJECTED' && 'Отклонены'}
                  {status === 'ALL' && 'Все'}
                </button>
              ))}
            </div>
          </div>

          {loadingReports ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="font-semibold text-slate-200">В этой категории нет жалоб</div>
              <div className="text-xs text-slate-500">
                Все материалы на платформе соответствуют правилам
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-5 rounded-2xl border transition ${
                    report.status === 'PENDING'
                      ? 'bg-slate-900/80 border-red-500/30 shadow-lg shadow-red-950/20'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            report.status === 'PENDING'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : report.status === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {report.status === 'PENDING'
                            ? 'На рассмотрении'
                            : report.status === 'RESOLVED'
                            ? 'Жалоба одобрена'
                            : 'Отклонена'}
                        </span>
                        <span className="font-semibold text-xs text-white">
                          Причина: {report.reason}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(report.createdAt).toLocaleString('ru-RU')}
                        </span>
                      </div>

                      {report.details && (
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          {report.details}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                        <div>
                          Визитка:{' '}
                          <Link
                            href={`/c/${report.card.slug}`}
                            target="_blank"
                            className="font-medium text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>{report.card.fullName || report.card.title || report.card.slug}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <span
                            className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                              report.card.published
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {report.card.published ? 'Опубликована' : 'Скрыта'}
                          </span>
                        </div>

                        <div>
                          Автор:{' '}
                          <span className="text-slate-300 font-mono text-[11px]">
                            {report.card.owner.email}
                          </span>
                          {report.card.owner.deletedAt && (
                            <span className="ml-1 text-[10px] text-red-400 font-bold">(Заблокирован)</span>
                          )}
                        </div>

                        {report.reporterIp && (
                          <div className="text-slate-500 font-mono text-[11px]">
                            IP заявителя: {report.reporterIp}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions for PENDING */}
                    {report.status === 'PENDING' && (
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          disabled={reportActionLoading === report.id}
                          onClick={() => handleReportAction(report.id, 'APPROVE_HIDE_CARD')}
                          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Скрыть визитку</span>
                        </button>

                        <button
                          disabled={reportActionLoading === report.id}
                          onClick={() => handleReportAction(report.id, 'BAN_AUTHOR')}
                          className="px-3 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-300 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5 text-red-400" />
                          <span>Бан автора</span>
                        </button>

                        <button
                          disabled={reportActionLoading === report.id}
                          onClick={() => handleReportAction(report.id, 'REJECT')}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition disabled:opacity-50"
                        >
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="w-full sm:w-auto relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Все роли</option>
                <option value="USER">Обычный (USER)</option>
                <option value="PRO">Тариф PRO</option>
                <option value="ADMIN">Администратор</option>
              </select>

              <button
                onClick={loadUsers}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
              >
                Найти
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Пользователь</th>
                    <th className="px-4 py-3">Роль</th>
                    <th className="px-4 py-3">Безопасность</th>
                    <th className="px-4 py-3">Визитки</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Пользователи не найдены
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isCurrentUser = u.id === currentUserId;
                      const isBlocked = u.deletedAt !== null;

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-white">{u.email}</div>
                            <div className="text-[10px] text-slate-500">
                              Регистрация: {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === 'ADMIN'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : u.role === 'PRO'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="space-y-0.5 text-[11px]">
                              <div
                                className={
                                  u.emailVerified ? 'text-emerald-400' : 'text-amber-400'
                                }
                              >
                                {u.emailVerified ? '✓ Email подтвержден' : '✕ Email не подтвержден'}
                              </div>
                              <div
                                className={
                                  u.totpEnabled ? 'text-emerald-400' : 'text-slate-500'
                                }
                              >
                                {u.totpEnabled ? '✓ 2FA активна' : '• 2FA отключена'}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-bold text-white">{u._count.cards}</span>{' '}
                            <span className="text-slate-500 text-[11px]">визиток</span>
                          </td>

                          <td className="px-4 py-3.5">
                            {isBlocked ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                Заблокирован
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                                Активен
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            {isCurrentUser ? (
                              <span className="text-[11px] text-slate-500 italic">
                                Текущий сеанс
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Role switcher */}
                                <select
                                  disabled={userActionLoading === u.id}
                                  value={u.role}
                                  onChange={(e) =>
                                    handleRoleChange(u.id, e.target.value as any)
                                  }
                                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-200 focus:outline-none"
                                >
                                  <option value="USER">USER</option>
                                  <option value="PRO">PRO</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>

                                {/* Block/Unblock Button */}
                                <button
                                  disabled={userActionLoading === u.id}
                                  onClick={() => handleToggleBlock(u.id, isBlocked)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                    isBlocked
                                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                  }`}
                                >
                                  {isBlocked ? 'Разблокировать' : 'Заблокировать'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Неизменяемый журнал аудита событий платформы</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Фиксация действий безопасности, модерации, удаления аккаунтов по 152-ФЗ и входов в систему
            </p>
          </div>

          {loadingAudit ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80">
              <div className="text-xs text-slate-500">Записей аудита не найдено</div>
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                        {log.action}
                      </span>
                      <span className="text-slate-300 font-medium">
                        {log.actor?.email || 'Системный процесс'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-4">
                    <span>
                      Цель: <strong className="text-slate-200">{log.targetType}</strong> (
                      <span className="font-mono">{log.targetId}</span>)
                    </span>
                    {log.ipAddress && (
                      <span className="font-mono text-slate-500">IP: {log.ipAddress}</span>
                    )}
                  </div>

                  {log.details && (
                    <div className="pt-1">
                      <pre className="text-[10px] font-mono bg-slate-950 p-2 rounded border border-slate-800/60 text-slate-400 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
