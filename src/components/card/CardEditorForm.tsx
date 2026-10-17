'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CardRenderer, { CardRenderData, CardRenderField } from './CardRenderer';
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
} from 'lucide-react';

interface CardEditorFormProps {
  initialCard?: CardRenderData & { published?: boolean; isIndexed?: boolean };
  isProUser?: boolean;
}

const COLOR_PRESETS = [
  { name: 'Синий (Неон)', hex: '#3b82f6' },
  { name: 'Изумруд', hex: '#10b981' },
  { name: 'Индиго / Фиолетовый', hex: '#8b5cf6' },
  { name: 'Розовый корунд', hex: '#f43f5e' },
  { name: 'Янтарь', hex: '#f59e0b' },
  { name: 'Графит', hex: '#64748b' },
];

export default function CardEditorForm({
  initialCard,
  isProUser = false,
}: CardEditorFormProps) {
  const router = useRouter();

  const isEditing = Boolean(initialCard?.id);

  // Form State
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [activeTab, setActiveTab] = useState<'profile' | 'fields' | 'design' | 'settings'>('profile');
  const [fullName, setFullName] = useState(initialCard?.fullName || '');
  const [position, setPosition] = useState(initialCard?.position || '');
  const [companyName, setCompanyName] = useState(initialCard?.companyName || '');
  const [bio, setBio] = useState(initialCard?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(initialCard?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(initialCard?.coverUrl || '');
  const [slug, setSlug] = useState(initialCard?.slug || '');

  const [templateId, setTemplateId] = useState<'modern' | 'minimal' | 'corporate'>(
    initialCard?.templateId || 'modern'
  );
  const [primaryColor, setPrimaryColor] = useState(
    initialCard?.themeConfig?.primaryColor || '#3b82f6'
  );
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>(
    initialCard?.themeConfig?.fontFamily || 'sans'
  );

  const [published, setPublished] = useState(initialCard?.published ?? true);
  const [isIndexed, setIsIndexed] = useState(initialCard?.isIndexed ?? false);

  const [fields, setFields] = useState<CardRenderField[]>(
    initialCard?.fields || [
      { type: CardFieldType.PHONE, label: 'Телефон', value: '', visible: true, sortOrder: 0 },
      { type: CardFieldType.TELEGRAM, label: 'Telegram', value: '', visible: true, sortOrder: 1 },
      { type: CardFieldType.EMAIL, label: 'Email', value: '', visible: true, sortOrder: 2 },
    ]
  );

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Construct preview data
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
    themeConfig: {
      primaryColor,
      fontFamily,
      layout: 'standard',
    },
    fields,
  };

  // Image Upload Handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
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

  // Field manipulation helpers
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

  // Form Submission
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
      fullName,
      position: position || null,
      companyName: companyName || null,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      coverUrl: coverUrl || null,
      slug: slug || null,
      templateId,
      themeConfig: {
        primaryColor,
        fontFamily,
        layout: 'standard',
      },
      published,
      isIndexed,
      fields: fields.map((f, i) => ({
        type: f.type,
        label: f.label,
        value: f.value,
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
        setErrorMessage(data.error || 'Ошибка при сохранении визитки');
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition shrink-0"
            title="Назад в панель управления"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isEditing ? 'Редактирование визитки' : 'Создание визитки'}
            </h1>
            <p className="text-xs text-slate-400">
              Настройте контакты, выберите шаблон и делитесь персональной ссылкой
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {initialCard?.slug && (
            <Link
              href={`/c/${initialCard.slug}`}
              target="_blank"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-300 hover:text-white transition"
            >
              <span>Открыть</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 text-xs active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Сохранение...' : 'Сохранить визитку'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm flex items-center gap-2.5">
          <Check className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Mobile Switcher between Form & Live Preview (Visible on screens < lg) */}
      <div className="lg:hidden flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition ${
            mobileView === 'editor'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
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
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Предпросмотр</span>
        </button>
      </div>

      {/* Editor Main Grid: Form Tabs (Left) + Live Mobile Mockup (Right) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor Tabs & Form */}
        <div className={`lg:col-span-7 space-y-6 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl transition shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Профиль</span>
            </button>

            <button
              onClick={() => setActiveTab('fields')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl transition shrink-0 ${
                activeTab === 'fields'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Контакты ({fields.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('design')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl transition shrink-0 ${
                activeTab === 'design'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Дизайн</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl transition shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Публикация</span>
            </button>
          </div>

          {/* Tab 1: Profile Details */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <h2 className="text-base font-bold text-white">Основная информация</h2>

              {/* Avatar & Cover Uploaders */}
              <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800/80">
                {/* Avatar */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Фото / Аватар (до 2 МБ)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Smartphone className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <label className="cursor-pointer py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-white transition flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>{uploadingAvatar ? 'Обработка...' : 'Загрузить фото'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'avatar')}
                      />
                    </label>
                  </div>
                </div>

                {/* Cover */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Обложка (до 3 МБ)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                      {coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <label className="cursor-pointer py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-white transition flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{uploadingCover ? 'Обработка...' : 'Загрузить обложку'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'cover')}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ФИО / Отображаемое имя <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Например, Александр Смирнов"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Должность
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Ведущий разработчик"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Компания
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="CardHub Inc."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    О себе (краткое описание)
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Кратко расскажите о вашей экспертизе, текущих проектах или темах для сотрудничества..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Contacts & Fields */}
          {activeTab === 'fields' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Контакты и ссылки</h2>
                  <p className="text-xs text-slate-400">
                    Добавьте каналы связи и переключайте видимость на публичной странице
                  </p>
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="flex flex-wrap gap-2 pt-1 pb-4 border-b border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.PHONE, 'Телефон')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" /> + Телефон
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.TELEGRAM, 'Telegram')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" /> + Telegram
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.WHATSAPP, 'WhatsApp')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> + WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.EMAIL, 'Email')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> + Email
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.WEBSITE, 'Сайт')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-purple-400" /> + Сайт
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.ADDRESS, 'Адрес')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> + Адрес
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField(CardFieldType.SCHEDULE, 'График работы')}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition"
                >
                  <Clock className="w-3.5 h-3.5 text-rose-400" /> + График
                </button>
              </div>

              {/* Active Fields List */}
              <div className="space-y-3">
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500">
                    Нет добавленных контактов. Воспользуйтесь кнопками выше, чтобы добавить телефон, соцсеть или сайт.
                  </div>
                ) : (
                  fields.map((f, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex-1 grid sm:grid-cols-3 gap-2 w-full">
                        <div>
                          <input
                            type="text"
                            value={f.label}
                            onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
                            placeholder="Подпись (напр. Telegram)"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => handleUpdateField(index, 'visible', !f.visible)}
                          className={`p-2 rounded-lg transition ${
                            f.visible
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-slate-500 hover:bg-slate-800'
                          }`}
                          title={f.visible ? 'Показывается на визитке' : 'Скрыто'}
                        >
                          {f.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Remove Field */}
                        <button
                          type="button"
                          onClick={() => handleRemoveField(index)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
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

          {/* Tab 3: Design & Styling */}
          {activeTab === 'design' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <h2 className="text-base font-bold text-white">Оформление и тема</h2>

              {/* Templates */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Шаблон визитки
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {[
                    { id: 'modern', title: 'Modern', desc: 'Стекло и неон' },
                    { id: 'minimal', title: 'Minimal', desc: 'Строгий минимализм' },
                    { id: 'corporate', title: 'Corporate', desc: 'Деловой стиль' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setTemplateId(tpl.id as any)}
                      className={`p-4 rounded-2xl border text-left transition ${
                        templateId === tpl.id
                          ? 'border-blue-500 bg-blue-600/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-sm">{tpl.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{tpl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300">
                  Фирменный цвет акцентов
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setPrimaryColor(color.hex)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                        primaryColor === color.hex
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {primaryColor === color.hex && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300">
                  Типографика (локальные безопасные шрифты)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs">
                  {[
                    { id: 'sans', name: 'Без засечек (Sans)' },
                    { id: 'serif', name: 'С засечками (Serif)' },
                    { id: 'mono', name: 'Технический (Mono)' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setFontFamily(font.id as any)}
                      className={`py-3 px-3 rounded-xl border text-center transition ${
                        fontFamily === font.id
                          ? 'border-blue-500 bg-blue-600/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Settings & Publishing */}
          {activeTab === 'settings' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <h2 className="text-base font-bold text-white">Параметры публикации</h2>

              {/* Publication Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">Опубликовать визитку</div>
                  <div className="text-xs text-slate-400 mt-0.5">
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
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Custom Slug */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white">Адрес визитки (slug)</label>
                  {!isProUser && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      Свой адрес в Pro
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">https://.../c/</span>
                  <input
                    type="text"
                    disabled={!isProUser}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="ivan-smirnov"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {isProUser
                    ? 'Латинские буквы, цифры и дефисы. Адрес должен быть уникальным.'
                    : 'Случайный безопасный 8-значный код генерируется автоматически.'}
                </p>
              </div>

              {/* Indexing Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">Индексация поисковиками (SEO)</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    По умолчанию визитка закрыта тегом <code className="text-blue-400">noindex</code> в целях приватности (152-ФЗ)
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isIndexed}
                    onChange={(e) => setIsIndexed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Mobile Mockup Preview */}
        <div className={`lg:col-span-5 sticky top-20 ${mobileView === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                <Smartphone className="w-4 h-4 text-blue-400" /> Живой предпросмотр
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Обновляется мгновенно
              </span>
            </div>

            {/* Mobile Device Frame */}
            <div className="p-3.5 rounded-[40px] bg-slate-900 border-4 border-slate-800 shadow-2xl relative overflow-hidden max-w-[390px] mx-auto">
              {/* Dynamic Island / Notch Mockup */}
              <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-3" />

              {/* Rendered Live Card */}
              <div className="max-h-[620px] overflow-y-auto rounded-3xl pr-0.5 scrollbar-thin">
                <CardRenderer card={liveCardData} isPreview={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
