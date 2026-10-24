'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CardRenderer, { CardRenderData, CardRenderField, CardThemeConfig } from './CardRenderer';
import { CardFieldType } from '@prisma/client';
import {
  Save,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Upload,
  Phone,
  Mail,
  Send,
  MessageCircle,
  Globe,
  MapPin,
  Clock,
  Sparkles,
  Palette,
  Layout,
  Sliders,
  ArrowLeft,
  Check,
  AlertCircle,
  Smartphone,
  ExternalLink,
  Briefcase,
  Tag,
  CreditCard,
  Layers,
  Shapes,
  Smile,
  X,
  User,
  ImageIcon,
} from 'lucide-react';

interface CardEditorFormProps {
  initialCard?: CardRenderData & { published?: boolean; isIndexed?: boolean };
  isProUser?: boolean;
}

// 12 human-friendly, harmonious colors
const HARMONIOUS_COLOR_PRESETS = [
  { name: 'Теплый янтарь', hex: '#d97706' },
  { name: 'Терракота', hex: '#c25e00' },
  { name: 'Шалфей / Эвкалипт', hex: '#0d9488' },
  { name: 'Кобальт / Сапфир', hex: '#2563eb' },
  { name: 'Глубокий изумруд', hex: '#059669' },
  { name: 'Бронза / Медь', hex: '#b45309' },
  { name: 'Пыльная роза', hex: '#e11d48' },
  { name: 'Каменный сланец', hex: '#64748b' },
  { name: 'Спокойный ирис', hex: '#6366f1' },
  { name: 'Кофе с молоком', hex: '#854d0e' },
  { name: 'Оливковый мох', hex: '#65a30d' },
  { name: 'Угольный графит', hex: '#334155' },
];

const THEME_TEMPLATES = [
  {
    id: 'warm_editorial',
    title: 'Warm Editorial',
    desc: 'Теплый журнальный стиль, антиква, благородный янтарь',
    bg: 'bg-[#121620]',
    accent: '#d97706',
  },
  {
    id: 'matte_graphite',
    title: 'Matte Graphite',
    desc: 'Бархатный темный графит, тактильный премиум',
    bg: 'bg-[#151921]',
    accent: '#64748b',
  },
  {
    id: 'nordic_clean',
    title: 'Nordic Clean',
    desc: 'Светлый скандинавский минимал, чистая бумага',
    bg: 'bg-[#FAF8F5]',
    accent: '#0d9488',
  },
  {
    id: 'executive_bronze',
    title: 'Executive Bronze',
    desc: 'Глубокий сапфир и бронза, статусность',
    bg: 'bg-[#0E1526]',
    accent: '#b45309',
  },
  {
    id: 'emerald_craft',
    title: 'Emerald Craft',
    desc: 'Хвойный лес, природный изумруд и спокойствие',
    bg: 'bg-[#0B1714]',
    accent: '#059669',
  },
  {
    id: 'terracotta_sunset',
    title: 'Terracotta Sunset',
    desc: 'Глина, средиземноморская теплая охра',
    bg: 'bg-[#1A1210]',
    accent: '#c25e00',
  },
  {
    id: 'glass_luxury',
    title: 'Glass Luxury',
    desc: 'Матовое полупрозрачное стекло с мягким блюром',
    bg: 'bg-slate-900/80',
    accent: '#6366f1',
  },
];

const STATUS_QUICK_PRESETS = [
  { text: '🟢 На связи онлайн', color: 'emerald' },
  { text: '💼 Открыт к предложениям', color: 'blue' },
  { text: '⚡ В офисе до 19:00', color: 'amber' },
  { text: '🗓 Запись на консультацию', color: 'purple' },
  { text: '🏖 В отпуске до понедельника', color: 'amber' },
];

export default function CardEditorForm({
  initialCard,
  isProUser = false,
}: CardEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialCard?.id);

  // Form Navigation State
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [activeTab, setActiveTab] = useState<
    'profile' | 'fields' | 'content' | 'design' | 'settings'
  >('profile');

  // Basic Profile State
  const [fullName, setFullName] = useState(initialCard?.fullName || '');
  const [position, setPosition] = useState(initialCard?.position || '');
  const [companyName, setCompanyName] = useState(initialCard?.companyName || '');
  const [bio, setBio] = useState(initialCard?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(initialCard?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(initialCard?.coverUrl || '');
  const [slug, setSlug] = useState(initialCard?.slug || '');

  // Status Badge State
  const [statusBadgeEnabled, setStatusBadgeEnabled] = useState(
    initialCard?.themeConfig?.statusBadge?.enabled ?? false
  );
  const [statusBadgeText, setStatusBadgeText] = useState(
    initialCard?.themeConfig?.statusBadge?.text || '🟢 На связи'
  );
  const [statusBadgeColor, setStatusBadgeColor] = useState(
    initialCard?.themeConfig?.statusBadge?.color || 'emerald'
  );

  // Rich Content: Tags
  const [tags, setTags] = useState<string[]>(
    initialCard?.themeConfig?.tags || ['Недвижимость', 'Инвестиции', 'Консультации']
  );
  const [newTagInput, setNewTagInput] = useState('');

  // Rich Content: Highlights (Key metrics)
  const [highlights, setHighlights] = useState<Array<{ label: string; value: string }>>(
    initialCard?.themeConfig?.highlights || [
      { label: 'Опыт в сфере', value: '8+ лет' },
      { label: 'Сделок закрыто', value: '350+' },
      { label: 'Рейтинг отзывов', value: '⭐ 4.9' },
    ]
  );

  // Rich Content: Services
  const [services, setServices] = useState<
    Array<{ title: string; desc?: string | null; price?: string | null; link?: string | null }>
  >(
    initialCard?.themeConfig?.services || [
      {
        title: 'Первичная консультация',
        desc: 'Разбор вашей ситуации, подбор оптимальной стратегии',
        price: 'Бесплатно',
      },
    ]
  );
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Rich Content: Payment Requisites
  const [paymentEnabled, setPaymentEnabled] = useState(
    initialCard?.themeConfig?.paymentRequisites?.enabled ?? false
  );
  const [paymentBank, setPaymentBank] = useState(
    initialCard?.themeConfig?.paymentRequisites?.bankName || 'Т-Банк / Сбер'
  );
  const [paymentRecipient, setPaymentRecipient] = useState(
    initialCard?.themeConfig?.paymentRequisites?.recipientName || ''
  );
  const [paymentNumber, setPaymentNumber] = useState(
    initialCard?.themeConfig?.paymentRequisites?.phoneOrCard || ''
  );
  const [paymentNote, setPaymentNote] = useState(
    initialCard?.themeConfig?.paymentRequisites?.note || 'Переводы по СБП'
  );

  // Design State
  const [templateId, setTemplateId] = useState<string>(
    initialCard?.templateId || 'warm_editorial'
  );
  const [primaryColor, setPrimaryColor] = useState(
    initialCard?.themeConfig?.primaryColor || '#d97706'
  );
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono' | 'rounded'>(
    (initialCard?.themeConfig?.fontFamily as any) || 'sans'
  );
  const [cardTexture, setCardTexture] = useState<
    'smooth' | 'mesh' | 'grid' | 'dots' | 'carbon' | 'linen'
  >((initialCard?.themeConfig?.cardTexture as any) || 'smooth');
  const [avatarShape, setAvatarShape] = useState<
    'squircle' | 'circle' | 'rounded' | 'portrait'
  >((initialCard?.themeConfig?.avatarShape as any) || 'squircle');
  const [avatarBorder, setAvatarBorder] = useState<
    'accent' | 'double' | 'thin' | 'none'
  >((initialCard?.themeConfig?.avatarBorder as any) || 'accent');
  const [buttonStyle, setButtonStyle] = useState<'rounded' | 'pill' | 'sharp'>(
    (initialCard?.themeConfig?.buttonStyle as any) || 'rounded'
  );
  const [coverStyle, setCoverStyle] = useState<'banner' | 'compact' | 'minimal'>(
    (initialCard?.themeConfig?.coverStyle as any) || 'banner'
  );

  // Settings State
  const [published, setPublished] = useState(initialCard?.published ?? true);
  const [isIndexed, setIsIndexed] = useState(initialCard?.isIndexed ?? false);

  // Contact Fields State
  const [fields, setFields] = useState<CardRenderField[]>(
    initialCard?.fields || [
      { type: CardFieldType.PHONE, label: 'Телефон', value: '', visible: true, sortOrder: 0 },
      { type: CardFieldType.TELEGRAM, label: 'Telegram', value: '', visible: true, sortOrder: 1 },
      { type: CardFieldType.WHATSAPP, label: 'WhatsApp', value: '', visible: true, sortOrder: 2 },
      { type: CardFieldType.EMAIL, label: 'Email', value: '', visible: true, sortOrder: 3 },
    ]
  );

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Construct Live Preview Data
  const liveThemeConfig: CardThemeConfig = {
    primaryColor,
    fontFamily,
    layout: 'standard',
    cardTexture,
    avatarShape,
    avatarBorder,
    buttonStyle,
    coverStyle,
    statusBadge: {
      enabled: statusBadgeEnabled,
      text: statusBadgeText,
      color: statusBadgeColor,
    },
    tags,
    highlights,
    services,
    paymentRequisites: {
      enabled: paymentEnabled,
      bankName: paymentBank,
      recipientName: paymentRecipient,
      phoneOrCard: paymentNumber,
      note: paymentNote,
    },
  };

  const liveCardData: CardRenderData = {
    id: initialCard?.id,
    slug: slug || 'preview',
    fullName: fullName || 'Имя Фамилия',
    position,
    companyName,
    bio,
    avatarUrl,
    coverUrl,
    templateId,
    themeConfig: liveThemeConfig,
    fields,
  };

  // Upload handler
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'avatar') setUploadingAvatar(true);
    else setUploadingCover(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Ошибка при загрузке изображения');
        return;
      }

      if (type === 'avatar') {
        setAvatarUrl(data.url);
      } else {
        setCoverUrl(data.url);
      }
    } catch {
      setErrorMessage('Не удалось загрузить файл на сервер');
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  // Field helpers
  const handleAddField = (type: CardFieldType, defaultLabel: string) => {
    const newField: CardRenderField = {
      type,
      label: defaultLabel,
      value: '',
      visible: true,
      sortOrder: fields.length,
    };
    setFields([...fields, newField]);
    setActiveTab('fields');
  };

  const handleUpdateField = (index: number, key: keyof CardRenderField, val: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: val };
    setFields(updated);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // Tag helpers
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (tags.includes(newTagInput.trim())) return;
    setTags([...tags, newTagInput.trim()]);
    setNewTagInput('');
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Service helpers
  const handleAddService = () => {
    if (!newServiceTitle.trim()) return;
    setServices([
      ...services,
      {
        title: newServiceTitle.trim(),
        desc: newServiceDesc.trim() || null,
        price: newServicePrice.trim() || null,
      },
    ]);
    setNewServiceTitle('');
    setNewServiceDesc('');
    setNewServicePrice('');
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Highlights helpers
  const handleUpdateHighlight = (index: number, key: 'label' | 'value', val: string) => {
    const updated = [...highlights];
    updated[index] = { ...updated[index], [key]: val };
    setHighlights(updated);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (fullName.trim().length < 2) {
      setErrorMessage('Пожалуйста, укажите имя (минимум 2 символа)');
      setActiveTab('profile');
      return;
    }

    setSaving(true);

    const payload = {
      fullName: fullName.trim(),
      position: position?.trim() || null,
      companyName: companyName?.trim() || null,
      bio: bio?.trim() || null,
      avatarUrl: avatarUrl?.trim() || null,
      coverUrl: coverUrl?.trim() || null,
      slug: slug?.trim() || null,
      templateId,
      themeConfig: liveThemeConfig,
      published,
      isIndexed,
      fields: fields
        .filter((f) => f.value && f.value.trim().length > 0)
        .map((f, i) => ({
          type: f.type,
          label: f.label || 'Контакт',
          value: f.value.trim(),
          visible: f.visible,
          sortOrder: i,
        })),
    };

    try {
      const endpoint = isEditing ? `/api/cards/${initialCard!.id}` : '/api/cards';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = data.error || 'Ошибка при сохранении визитки';
        if (data.details && typeof data.details === 'object') {
          const detailStrings = Object.entries(data.details)
            .map(([field, errs]) => Array.isArray(errs) ? `${errs.join(', ')}` : String(errs))
            .filter(Boolean);
          if (detailStrings.length > 0) {
            msg += `: ${detailStrings.join('; ')}`;
          }
        }
        setErrorMessage(msg);
        setSaving(false);
        return;
      }

      setSuccessMessage('Визитка успешно сохранена!');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch {
      setErrorMessage('Не удалось связаться с сервером');
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      {/* Top Header */}
      <div className="w-full min-w-full flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/dashboard"
            className="p-2 sm:p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-stone-700 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white transition shrink-0"
            title="Назад в панель управления"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight truncate">
              {isEditing ? 'Настройка визитки' : 'Создание визитки'}
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 hidden sm:block truncate">
              Контакты, услуги, статус и глубокая кастомизация внешнего вида
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {initialCard?.slug && (
            <Link
              href={`/c/${initialCard.slug}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-100 dark:bg-stone-900/80 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition shadow-sm"
              title="Открыть публичную визитку"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Посмотреть</span>
            </Link>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 py-2 px-4 sm:px-5 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/30 text-xs active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2.5">
          <Check className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Mobile Switcher between Editor Form & Live Preview */}
      <div className="w-full min-w-0 lg:hidden flex items-center p-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition ${
            mobileView === 'editor'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Редактор данных</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition ${
            mobileView === 'preview'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Предпросмотр</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="w-full min-w-0 max-w-full grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Tabs */}
        <div
          className={`w-full min-w-0 max-w-full lg:col-span-7 space-y-6 ${
            mobileView === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Tabs Navigation */}
          <div className="w-full min-w-0 max-w-full overflow-x-auto no-scrollbar scroll-smooth">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-900/90 border border-stone-300 dark:border-stone-800 text-xs font-semibold whitespace-nowrap min-w-full sm:min-w-0">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Профиль</span>
              </button>

              <button
                onClick={() => setActiveTab('fields')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition shrink-0 ${
                  activeTab === 'fields'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Контакты ({fields.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition shrink-0 ${
                  activeTab === 'content'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Услуги и контент</span>
              </button>

              <button
                onClick={() => setActiveTab('design')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition shrink-0 ${
                  activeTab === 'design'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Дизайн и стиль</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition shrink-0 ${
                  activeTab === 'settings'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Публикация</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Profile Details & Status */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-800 space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-amber-500" />
                <span>Основная информация профиля</span>
              </h2>

              {/* Status Badge Configuration */}
              <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Статус-бейдж активности</span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Показывается над именем с пульсирующим световым индикатором
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusBadgeEnabled}
                      onChange={(e) => setStatusBadgeEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {statusBadgeEnabled && (
                  <div className="space-y-2 pt-2 border-t border-stone-800/80">
                    <input
                      type="text"
                      value={statusBadgeText}
                      onChange={(e) => setStatusBadgeText(e.target.value)}
                      placeholder="Например, 🟢 На связи онлайн"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-850 border border-stone-750 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {STATUS_QUICK_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setStatusBadgeText(p.text);
                            setStatusBadgeColor(p.color);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 transition"
                        >
                          {p.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar & Cover Uploaders */}
              <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-stone-800">
                {/* Avatar */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-300">
                    Фото / Аватар (до 2 МБ)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-850 border border-stone-750 flex items-center justify-center text-stone-400 shrink-0 shadow-inner">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-stone-400" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingAvatar ? 'Загрузка...' : 'Загрузить фото'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleUpload(e, 'avatar')}
                          className="hidden"
                          disabled={uploadingAvatar}
                        />
                      </label>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="block text-[11px] text-rose-400 hover:underline"
                        >
                          Удалить фото
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-300">
                    Фон / Баннер шапки (до 3 МБ)
                  </label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-24 h-16 rounded-2xl overflow-hidden bg-stone-850 border border-stone-750 flex items-center justify-center text-stone-500 shrink-0 shadow-inner"
                      style={{
                        background: coverUrl
                          ? `url(${coverUrl}) center/cover no-repeat`
                          : 'linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(19, 24, 37, 0.95))',
                      }}
                    >
                      {!coverUrl && <ImageIcon className="w-5 h-5 text-stone-500" />}
                    </div>
                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingCover ? 'Загрузка...' : 'Загрузить фон'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleUpload(e, 'cover')}
                          className="hidden"
                          disabled={uploadingCover}
                        />
                      </label>
                      {coverUrl && (
                        <button
                          type="button"
                          onClick={() => setCoverUrl('')}
                          className="block text-[11px] text-rose-400 hover:underline"
                        >
                          Удалить баннер
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Имя и фамилия <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Алексей Морозов"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-850 border border-stone-750 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition shadow-inner"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Должность / Специализация
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Ведущий брокер по недвижимости"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-850 border border-stone-750 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Компания / Проект
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Prime Realty & Partners"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-850 border border-stone-750 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    О себе / Краткое описание
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Помогаю выгодно приобретать недвижимость и инвестировать в ликвидные активы. Буду рад ответить на любые вопросы!"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-850 border border-stone-750 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition shadow-inner leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Contacts & Fields */}
          {activeTab === 'fields' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Контакты и мессенджеры</h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Добавьте каналы связи. Кнопки звонка, Telegram и WhatsApp автоматически отображаются в шапке
                  </p>
                </div>
              </div>

              {/* Add Field Buttons */}
              <div className="flex flex-wrap gap-2 pt-1 pb-3 border-b border-stone-800">
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.PHONE, 'Телефон')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> + Телефон
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.TELEGRAM, 'Telegram')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 transition"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" /> + Telegram
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.WHATSAPP, 'WhatsApp')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> + WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.EMAIL, 'Email')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> + Email
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.VK, 'ВКонтакте')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> + VK
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.WEBSITE, 'Сайт')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-purple-400" /> + Сайт
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.ADDRESS, 'Адрес офиса')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> + Адрес
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.SCHEDULE, 'График работы')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 transition"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> + График
                </button>
              </div>

              {/* Active Fields List */}
              <div className="space-y-3">
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-sm text-stone-500">
                    Нет добавленных контактов. Добавьте телефон, Telegram или почту кнопками выше.
                  </div>
                ) : (
                  fields.map((f, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex-1 grid sm:grid-cols-3 gap-2 w-full">
                        <div>
                          <input
                            type="text"
                            value={f.label}
                            onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
                            placeholder="Подпись (напр. Рабочий)"
                            className="w-full px-3 py-2 rounded-xl bg-stone-850 border border-stone-750 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={f.value}
                            onChange={(e) => handleUpdateField(index, 'value', e.target.value)}
                            placeholder={
                              f.type === CardFieldType.PHONE
                                ? '+7 (999) 000-00-00'
                                : f.type === CardFieldType.TELEGRAM
                                ? '@username или ссылка t.me/...'
                                : f.type === CardFieldType.EMAIL
                                ? 'name@company.ru'
                                : 'Значение или ссылка'
                            }
                            className="w-full px-3 py-2 rounded-xl bg-stone-850 border border-stone-750 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleUpdateField(index, 'visible', !f.visible)}
                          className={`p-2 rounded-xl transition ${
                            f.visible
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-stone-500 hover:bg-stone-800'
                          }`}
                          title={f.visible ? 'Показывается на визитке' : 'Скрыто'}
                        >
                          {f.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveField(index)}
                          className="p-2 rounded-xl text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Удалить поле"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Rich Content, Services, Highlights, Requisites */}
          {activeTab === 'content' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-800 space-y-8">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span>Наполнение и экспертный контент</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Сделайте карточку богатой и убедительной: добавьте теги специализации, ключевые цифры, услуги и реквизиты
                </p>
              </div>

              {/* Specialization Tags */}
              <div className="space-y-3 pb-6 border-b border-stone-800">
                <label className="block text-xs font-bold text-white flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Теги компетенций и специализации</span>
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Например: Ипотека 6%, Новостройки, Инвестиции..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-white text-xs font-semibold transition"
                  >
                    + Добавить
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-850 border border-stone-750 text-xs text-stone-200"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-stone-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights / Key Metrics */}
              <div className="space-y-3 pb-6 border-b border-stone-800">
                <label className="block text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ключевые показатели / Достижения (до 3 метрик)</span>
                </label>

                <div className="grid sm:grid-cols-3 gap-3">
                  {highlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-stone-900 border border-stone-800 space-y-2"
                    >
                      <div>
                        <div className="text-[10px] text-stone-400 mb-1">Число / Значение:</div>
                        <input
                          type="text"
                          value={hl.value}
                          onChange={(e) => handleUpdateHighlight(idx, 'value', e.target.value)}
                          placeholder="8+ лет"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-stone-850 border border-stone-750 text-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400 mb-1">Подпись:</div>
                        <input
                          type="text"
                          value={hl.label}
                          onChange={(e) => handleUpdateHighlight(idx, 'label', e.target.value)}
                          placeholder="Опыт в отрасли"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-stone-850 border border-stone-750 text-stone-300 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-4 pb-6 border-b border-stone-800">
                <label className="block text-xs font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>Услуги и спецпредложения</span>
                </label>

                {/* Add Service Box */}
                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newServiceTitle}
                      onChange={(e) => setNewServiceTitle(e.target.value)}
                      placeholder="Название услуги (напр. Подбор квартиры)"
                      className="sm:col-span-2 px-3 py-2 rounded-xl bg-stone-850 border border-stone-750 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      placeholder="Цена (напр. Бесплатно или от 10 000 ₽)"
                      className="px-3 py-2 rounded-xl bg-stone-850 border border-stone-750 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      placeholder="Краткое описание услуги для клиентов..."
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-850 border border-stone-750 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
                    >
                      + Добавить услугу
                    </button>
                  </div>
                </div>

                {/* Services Cards */}
                <div className="space-y-2">
                  {services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{srv.title}</span>
                          {srv.price && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {srv.price}
                            </span>
                          )}
                        </div>
                        {srv.desc && (
                          <div className="text-[11px] text-stone-400 mt-0.5">{srv.desc}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="p-2 text-stone-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Requisites / СБП */}
              <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Реквизиты для оплаты и перевода по СБП</span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Позволяет клиентам копировать ваш номер карты или телефона в 1 клик
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentEnabled}
                      onChange={(e) => setPaymentEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {paymentEnabled && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-stone-800">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Банк</label>
                      <input
                        type="text"
                        value={paymentBank}
                        onChange={(e) => setPaymentBank(e.target.value)}
                        placeholder="Т-Банк / Сбер"
                        className="w-full px-3 py-2 rounded-xl bg-stone-850 border border-stone-750 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">
                        Номер карты или телефона
                      </label>
                      <input
                        type="text"
                        value={paymentNumber}
                        onChange={(e) => setPaymentNumber(e.target.value)}
                        placeholder="+7 (999) 000-00-00"
                        className="w-full px-3 py-2 rounded-xl bg-stone-850 border border-stone-750 text-white text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-stone-400 mb-1">
                        Имя получателя (ФИО)
                      </label>
                      <input
                        type="text"
                        value={paymentRecipient}
                        onChange={(e) => setPaymentRecipient(e.target.value)}
                        placeholder="Алексей М."
                        className="w-full px-3 py-2 rounded-xl bg-stone-850 border border-stone-750 text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Deep Design & Styling */}
          {activeTab === 'design' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-800 space-y-8">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span>Дизайн, стили и кастомизация</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Выберите стиль визитки, гармоничные цвета, тактильную текстуру, форму аватара и кнопок
                </p>
              </div>

              {/* Theme Templates (7 distinct styles) */}
              <div className="space-y-3 pb-6 border-b border-stone-800">
                <label className="block text-xs font-bold text-white">
                  1. Шаблон и стиль оформления
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEME_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setTemplateId(tpl.id);
                        setPrimaryColor(tpl.accent);
                      }}
                      className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                        templateId === tpl.id
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/50'
                          : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: tpl.accent }}
                      />
                      <div>
                        <div className="font-bold text-xs text-white">{tpl.title}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                          {tpl.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Harmonious Color Palette + Custom Picker */}
              <div className="space-y-3 pb-6 border-b border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white">
                    2. Цветовая палитра акцентов
                  </label>
                  <span className="text-[11px] text-stone-400 font-mono">{primaryColor}</span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2.5">
                  {HARMONIOUS_COLOR_PRESETS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setPrimaryColor(color.hex)}
                      className={`h-9 rounded-xl flex items-center justify-center transition active:scale-95 ${
                        primaryColor === color.hex
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-stone-950 scale-105'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {primaryColor === color.hex && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs text-stone-400">Свой оттенок:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-24 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Card Texture */}
              <div className="space-y-3 pb-6 border-b border-stone-800">
                <label className="block text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Текстура фона карточки</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                  {[
                    { id: 'smooth', name: 'Гладкая' },
                    { id: 'mesh', name: 'Градиент' },
                    { id: 'grid', name: 'Сетка' },
                    { id: 'dots', name: 'Точки' },
                    { id: 'carbon', name: 'Карбон' },
                    { id: 'linen', name: 'Бумага/Лен' },
                  ].map((tex) => (
                    <button
                      key={tex.id}
                      type="button"
                      onClick={() => setCardTexture(tex.id as any)}
                      className={`py-2 px-2 rounded-xl border text-center transition ${
                        cardTexture === tex.id
                          ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      {tex.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Shape & Borders */}
              <div className="grid sm:grid-cols-2 gap-4 pb-6 border-b border-stone-800">
                {/* Shape */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">4. Форма аватара</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'squircle', name: 'Сквиркл' },
                      { id: 'circle', name: 'Круглый' },
                      { id: 'rounded', name: 'Квадрат' },
                      { id: 'portrait', name: 'Портрет' },
                    ].map((sh) => (
                      <button
                        key={sh.id}
                        type="button"
                        onClick={() => setAvatarShape(sh.id as any)}
                        className={`py-2 px-3 rounded-xl border text-center transition ${
                          avatarShape === sh.id
                            ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                            : 'border-stone-800 bg-stone-900 text-stone-400'
                        }`}
                      >
                        {sh.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">5. Рамка аватара</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'accent', name: 'Цветной ободок' },
                      { id: 'double', name: 'Двойная рамка' },
                      { id: 'thin', name: 'Тонкая' },
                      { id: 'none', name: 'Без рамки' },
                    ].map((bd) => (
                      <button
                        key={bd.id}
                        type="button"
                        onClick={() => setAvatarBorder(bd.id as any)}
                        className={`py-2 px-3 rounded-xl border text-center transition ${
                          avatarBorder === bd.id
                            ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                            : 'border-stone-800 bg-stone-900 text-stone-400'
                        }`}
                      >
                        {bd.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Button Style & Cover Style */}
              <div className="grid sm:grid-cols-2 gap-4 pb-6 border-b border-stone-800">
                {/* Button Style */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">6. Стиль кнопок</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'rounded', name: 'Скругленный' },
                      { id: 'pill', name: 'Капсула' },
                      { id: 'sharp', name: 'Строгий' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setButtonStyle(btn.id as any)}
                        className={`py-2 px-2 rounded-xl border text-center transition ${
                          buttonStyle === btn.id
                            ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                            : 'border-stone-800 bg-stone-900 text-stone-400'
                        }`}
                      >
                        {btn.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover Style */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">7. Шапка / Баннер</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'banner', name: 'Высокая' },
                      { id: 'compact', name: 'Компакт' },
                      { id: 'minimal', name: 'Без шапки' },
                    ].map((cov) => (
                      <button
                        key={cov.id}
                        type="button"
                        onClick={() => setCoverStyle(cov.id as any)}
                        className={`py-2 px-2 rounded-xl border text-center transition ${
                          coverStyle === cov.id
                            ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                            : 'border-stone-800 bg-stone-900 text-stone-400'
                        }`}
                      >
                        {cov.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-white">
                  8. Типографика (шрифтовой стиль)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'sans', name: 'Гротеск (Sans)' },
                    { id: 'serif', name: 'Антиква (Serif)' },
                    { id: 'mono', name: 'Технический (Mono)' },
                    { id: 'rounded', name: 'Мягкий (Rounded)' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setFontFamily(font.id as any)}
                      className={`py-2.5 px-3 rounded-xl border text-center transition ${
                        fontFamily === font.id
                          ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                          : 'border-stone-800 bg-stone-900 text-stone-400'
                      }`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Settings & Publishing */}
          {activeTab === 'settings' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-800 space-y-6">
              <h2 className="text-base font-bold text-white">Параметры публикации</h2>

              {/* Publication Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <div>
                  <div className="text-sm font-bold text-white">Опубликовать визитку</div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    При выключении страница будет показывать сообщение о временной недоступности
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* SEO Search Indexing Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <div>
                  <div className="text-sm font-bold text-white">
                    Индексация поисковыми системами (SEO)
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    Разрешить Яндексу и Google находить страницу визитки по имени и фамилии
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isIndexed}
                    onChange={(e) => setIsIndexed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Slug / Short Link */}
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                <label className="block text-xs font-bold text-white">
                  Короткий адрес визитки (URL)
                </label>
                <div className="flex items-center rounded-xl bg-stone-850 border border-stone-750 overflow-hidden px-3">
                  <span className="text-xs text-stone-500 font-mono select-none">/c/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    disabled={!isProUser && Boolean(initialCard?.slug)}
                    placeholder={initialCard?.slug || 'my-card-name'}
                    className="flex-1 py-2 px-1 bg-transparent text-white text-xs font-mono focus:outline-none disabled:text-stone-500"
                  />
                </div>
                {!isProUser && (
                  <p className="text-[11px] text-stone-400">
                    Персональный красивый адрес (например, /c/ivanov) доступен на тарифе Pro
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Mobile Mockup */}
        <div
          className={`w-full min-w-0 max-w-full lg:col-span-5 sticky top-24 ${
            mobileView === 'editor' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="text-center text-xs text-stone-400 mb-3 font-medium flex items-center justify-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-amber-500" />
            <span>Живой предпросмотр визитки</span>
          </div>

          <div className="p-2 sm:p-3 rounded-[38px] bg-stone-900/90 border border-stone-800 shadow-2xl">
            <CardRenderer card={liveCardData} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
