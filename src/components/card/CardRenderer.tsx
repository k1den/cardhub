'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Globe,
  Send,
  MessageCircle,
  MapPin,
  Clock,
  ExternalLink,
  Download,
  Share2,
  QrCode,
  AlertTriangle,
  Check,
  Copy,
  CreditCard,
  Briefcase,
  Sparkles,
  Tag,
  ChevronRight,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { CardFieldType } from '@prisma/client';

export interface CardRenderField {
  id?: string;
  type: CardFieldType;
  label: string;
  value: string;
  visible: boolean;
  sortOrder?: number;
}

export interface CardThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono' | 'display' | 'rounded';
  layout?: 'standard' | 'compact' | 'expanded';
  cardSurface?: 'dark' | 'light' | 'warm_paper' | 'graphite' | 'glass';
  cardTexture?: 'smooth' | 'gradient' | 'mesh' | 'dots' | 'grid' | 'carbon' | 'linen';
  avatarShape?: 'squircle' | 'circle' | 'rounded' | 'portrait';
  avatarBorder?: 'accent' | 'thin' | 'none' | 'double' | 'glow';
  buttonStyle?: 'rounded' | 'pill' | 'sharp' | 'glass' | 'outline';
  coverStyle?: 'banner' | 'compact' | 'gradient' | 'minimal';
  statusBadge?: {
    enabled: boolean;
    text: string;
    color?: string;
  };
  tags?: string[];
  services?: Array<{
    title: string;
    desc?: string | null;
    price?: string | null;
    link?: string | null;
  }>;
  highlights?: Array<{
    label: string;
    value: string;
  }>;
  paymentRequisites?: {
    enabled: boolean;
    bankName?: string | null;
    recipientName?: string | null;
    phoneOrCard?: string | null;
    note?: string | null;
  };
}

export interface CardRenderData {
  id?: string;
  slug: string;
  fullName: string;
  position?: string | null;
  companyName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  templateId: string;
  themeConfig?: CardThemeConfig;
  fields: CardRenderField[];
  company?: {
    name: string;
    logoUrl?: string | null;
    brandColor?: string | null;
    website?: string | null;
  } | null;
}

interface CardRendererProps {
  card: CardRenderData;
  isPreview?: boolean;
  onOpenQr?: () => void;
  onOpenReport?: () => void;
}

export default function CardRenderer({
  card,
  isPreview = false,
  onOpenQr,
  onOpenReport,
}: CardRendererProps) {
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedRequisites, setCopiedRequisites] = useState(false);

  const theme = card.themeConfig || {};
  const primaryColor = theme.primaryColor || card.company?.brandColor || '#d97706';
  const fontFamily = theme.fontFamily || 'sans';
  const template = card.templateId || 'warm_editorial';
  const cardTexture = theme.cardTexture || 'smooth';
  const avatarShape = theme.avatarShape || 'squircle';
  const avatarBorder = theme.avatarBorder || 'accent';
  const buttonStyle = theme.buttonStyle || 'rounded';
  const coverStyle = theme.coverStyle || 'banner';

  // Visible fields only
  const visibleFields = (card.fields || [])
    .filter((f) => f.visible && f.value.trim().length > 0)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // Determine quick action fields (phone, telegram, whatsapp, email, address)
  const phoneField = visibleFields.find((f) => f.type === CardFieldType.PHONE);
  const telegramField = visibleFields.find((f) => f.type === CardFieldType.TELEGRAM);
  const whatsappField = visibleFields.find((f) => f.type === CardFieldType.WHATSAPP);
  const emailField = visibleFields.find((f) => f.type === CardFieldType.EMAIL);
  const addressField = visibleFields.find((f) => f.type === CardFieldType.ADDRESS);

  // Typography Class
  const fontClass =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : fontFamily === 'rounded'
      ? 'font-sans tracking-wide'
      : 'font-sans';

  // Card Texture Class
  const textureClass =
    cardTexture === 'dots'
      ? 'texture-dots'
      : cardTexture === 'grid'
      ? 'texture-grid'
      : cardTexture === 'mesh'
      ? 'texture-mesh'
      : cardTexture === 'carbon'
      ? 'texture-carbon'
      : cardTexture === 'linen'
      ? 'texture-linen'
      : '';

  // Theme Base Classes
  const getThemeContainerClasses = () => {
    switch (template) {
      case 'nordic_clean':
        return 'bg-[#FAF8F5] border border-stone-200/90 text-stone-900 shadow-xl shadow-stone-300/40';
      case 'warm_editorial':
        return 'bg-[#121620] border border-amber-900/20 text-stone-100 shadow-2xl shadow-black/60';
      case 'matte_graphite':
        return 'bg-[#151921] border border-slate-800 text-slate-100 shadow-2xl shadow-black/70';
      case 'glass_luxury':
        return 'glass-panel text-white shadow-2xl backdrop-blur-2xl';
      case 'executive_bronze':
        return 'bg-[#0E1526] border border-amber-500/20 text-slate-100 shadow-2xl shadow-blue-950/40';
      case 'emerald_craft':
        return 'bg-[#0B1714] border border-emerald-900/30 text-emerald-50 shadow-2xl shadow-emerald-950/40';
      case 'terracotta_sunset':
        return 'bg-[#1A1210] border border-orange-900/30 text-stone-100 shadow-2xl shadow-orange-950/30';
      case 'minimal':
        return 'bg-[#0F141C] border border-slate-800 text-slate-200 shadow-xl';
      case 'corporate':
        return 'bg-[#111827] border border-slate-800 text-white shadow-2xl';
      case 'modern':
      default:
        return 'bg-[#131824] border border-slate-800 text-white shadow-2xl';
    }
  };

  const isLightTheme = template === 'nordic_clean';

  // Avatar Shape Classes
  const getAvatarShapeClass = () => {
    switch (avatarShape) {
      case 'circle':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-xl';
      case 'portrait':
        return 'rounded-2xl aspect-[4/5] object-cover';
      case 'squircle':
      default:
        return 'rounded-3xl';
    }
  };

  // Avatar Border Styles
  const getAvatarBorderStyle = () => {
    if (avatarBorder === 'none') return {};
    if (avatarBorder === 'thin') {
      return { border: `2px solid ${isLightTheme ? '#e5e7eb' : 'rgba(255, 255, 255, 0.15)'}` };
    }
    if (avatarBorder === 'double') {
      return {
        boxShadow: `0 0 0 3px ${isLightTheme ? '#FAF8F5' : '#121620'}, 0 0 0 6px ${primaryColor}`,
      };
    }
    // accent / glow default
    return {
      border: `3.5px solid ${primaryColor}`,
      boxShadow: `0 8px 24px ${primaryColor}30`,
    };
  };

  // Button Shape Classes
  const getButtonRadiusClass = () => {
    switch (buttonStyle) {
      case 'pill':
        return 'rounded-full';
      case 'sharp':
        return 'rounded-md';
      case 'rounded':
      default:
        return 'rounded-2xl';
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.fullName,
          text: `Цифровая визитка: ${card.fullName}${card.position ? ` • ${card.position}` : ''}`,
          url,
        });
      } catch {
        // fallback
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleCopyRequisites = (text: string) => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(text);
    setCopiedRequisites(true);
    setTimeout(() => setCopiedRequisites(false), 2000);
  };

  const getFieldIcon = (type: CardFieldType) => {
    switch (type) {
      case CardFieldType.PHONE:
        return <Phone className="w-4 h-4" />;
      case CardFieldType.EMAIL:
        return <Mail className="w-4 h-4" />;
      case CardFieldType.TELEGRAM:
        return <Send className="w-4 h-4" />;
      case CardFieldType.WHATSAPP:
        return <MessageCircle className="w-4 h-4" />;
      case CardFieldType.WEBSITE:
      case CardFieldType.CUSTOM_LINK:
        return <Globe className="w-4 h-4" />;
      case CardFieldType.ADDRESS:
        return <MapPin className="w-4 h-4" />;
      case CardFieldType.SCHEDULE:
        return <Clock className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const formatFieldHref = (type: CardFieldType, val: string) => {
    switch (type) {
      case CardFieldType.PHONE:
        return `tel:${val.replace(/[^\d+]/g, '')}`;
      case CardFieldType.EMAIL:
        return `mailto:${val.trim()}`;
      case CardFieldType.TELEGRAM: {
        const tg = val.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
        return `https://t.me/${tg}`;
      }
      case CardFieldType.WHATSAPP: {
        const wa = val.replace(/[^\d]/g, '');
        return `https://wa.me/${wa}`;
      }
      case CardFieldType.VK: {
        if (val.startsWith('http')) return val;
        return `https://vk.com/${val.replace(/^@/, '')}`;
      }
      case CardFieldType.ADDRESS: {
        return `https://maps.yandex.ru/?text=${encodeURIComponent(val)}`;
      }
      default:
        return val.startsWith('http') ? val : `https://${val}`;
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto min-h-[620px] rounded-[32px] overflow-hidden relative transition-all duration-300 ${fontClass} ${textureClass} ${getThemeContainerClasses()}`}
    >
      {/* Cover / Header Banner */}
      {coverStyle !== 'minimal' && (
        <div
          className={`w-full relative overflow-hidden transition-all duration-300 ${
            coverStyle === 'compact' ? 'h-24 sm:h-28' : 'h-36 sm:h-44'
          }`}
          style={{
            background: card.coverUrl
              ? `url(${card.coverUrl}) center/cover no-repeat`
              : `linear-gradient(135deg, ${primaryColor}40 0%, ${
                  isLightTheme ? '#E7E5E4' : '#0B0F17'
                } 100%)`,
          }}
        >
          {/* Subtle bottom fade */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 40%, ${
                isLightTheme ? 'rgba(250, 248, 245, 0.95)' : 'rgba(18, 22, 32, 0.95)'
              } 100%)`,
            }}
          />
        </div>
      )}

      {/* Main Profile Body */}
      <div
        className={`px-5 sm:px-6 relative pb-7 space-y-6 ${
          coverStyle === 'minimal' ? 'pt-6' : '-mt-16 sm:-mt-20'
        }`}
      >
        {/* Avatar + Top Controls Row */}
        <div className="flex items-end justify-between gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 overflow-hidden flex items-center justify-center font-bold text-2xl sm:text-3xl select-none transition-transform duration-200 ${getAvatarShapeClass()} ${
                isLightTheme
                  ? 'bg-stone-200 text-stone-700'
                  : 'bg-stone-800 text-stone-100'
              }`}
              style={getAvatarBorderStyle()}
            >
              {card.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.avatarUrl}
                  alt={card.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {card.fullName
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase())
                    .join('') || 'CH'}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Badges (Share & QR Code) */}
          {!isPreview && (
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={handleShare}
                className={`p-2.5 rounded-2xl border transition active:scale-95 ${
                  isLightTheme
                    ? 'bg-stone-100/80 hover:bg-stone-200/80 border-stone-300 text-stone-700'
                    : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-300 hover:text-white'
                }`}
                title="Поделиться визиткой"
              >
                {copiedShare ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {onOpenQr && (
                <button
                  onClick={onOpenQr}
                  className={`p-2.5 rounded-2xl border transition active:scale-95 ${
                    isLightTheme
                      ? 'bg-stone-100/80 hover:bg-stone-200/80 border-stone-300 text-stone-700'
                      : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-300 hover:text-white'
                  }`}
                  title="Показать QR-код"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Identity & Status */}
        <div className="space-y-2">
          {/* Status Badge (if enabled) */}
          {theme.statusBadge?.enabled && theme.statusBadge.text && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-sm bg-stone-900/40 border-stone-700/60 text-stone-200">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor:
                    theme.statusBadge.color === 'amber'
                      ? '#f59e0b'
                      : theme.statusBadge.color === 'blue'
                      ? '#3b82f6'
                      : theme.statusBadge.color === 'purple'
                      ? '#a855f7'
                      : '#10b981',
                }}
              />
              <span>{theme.statusBadge.text}</span>
            </div>
          )}

          {/* Full Name */}
          <h1
            className={`text-2xl sm:text-3xl font-black tracking-tight leading-snug ${
              isLightTheme ? 'text-stone-900' : 'text-white'
            }`}
          >
            {card.fullName}
          </h1>

          {/* Position & Company */}
          {(card.position || card.companyName || card.company?.name) && (
            <div
              className={`text-xs sm:text-sm font-medium flex flex-wrap items-center gap-1.5 ${
                isLightTheme ? 'text-stone-600' : 'text-stone-300'
              }`}
            >
              {card.position && <span>{card.position}</span>}
              {card.position && (card.companyName || card.company?.name) && (
                <span className={isLightTheme ? 'text-stone-400' : 'text-stone-600'}>•</span>
              )}
              {(card.companyName || card.company?.name) && (
                <span
                  className="font-semibold inline-flex items-center gap-1.5"
                  style={{ color: primaryColor }}
                >
                  {card.company?.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.company.logoUrl}
                      alt={card.company.name}
                      className="w-4 h-4 rounded object-contain inline-block"
                    />
                  )}
                  <span>{card.companyName || card.company?.name}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bio / About */}
        {card.bio && (
          <p
            className={`text-xs sm:text-sm leading-relaxed p-3.5 rounded-2xl border ${
              isLightTheme
                ? 'bg-stone-100/70 border-stone-200 text-stone-700'
                : 'bg-stone-900/50 border-stone-800 text-stone-300'
            }`}
          >
            {card.bio}
          </p>
        )}

        {/* Tags / Specializations (if any) */}
        {theme.tags && theme.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {theme.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-xl border flex items-center gap-1 transition ${
                  isLightTheme
                    ? 'bg-stone-100 border-stone-200 text-stone-700'
                    : 'bg-stone-900/70 border-stone-800 text-stone-300'
                }`}
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Highlights Bar (Key Metrics, e.g. 10+ лет опыта) */}
        {theme.highlights && theme.highlights.length > 0 && (
          <div
            className={`grid grid-cols-${Math.min(
              theme.highlights.length,
              3
            )} gap-2 p-3 rounded-2xl border ${
              isLightTheme
                ? 'bg-stone-100/80 border-stone-200'
                : 'bg-stone-900/60 border-stone-800'
            }`}
          >
            {theme.highlights.map((hl, idx) => (
              <div key={idx} className="text-center px-1">
                <div
                  className="text-base sm:text-lg font-black tracking-tight"
                  style={{ color: primaryColor }}
                >
                  {hl.value}
                </div>
                <div
                  className={`text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5 truncate ${
                    isLightTheme ? 'text-stone-500' : 'text-stone-400'
                  }`}
                >
                  {hl.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 1-Click Action Grid (Call, Telegram, WhatsApp, Email, Map) */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
          {phoneField && (
            <a
              href={formatFieldHref(CardFieldType.PHONE, phoneField.value)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition active:scale-95 group ${
                isLightTheme
                  ? 'bg-stone-100/90 hover:bg-stone-200/90 border-stone-200 text-stone-800'
                  : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-200'
              }`}
              title="Позвонить"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition group-hover:scale-110"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium mt-1.5 truncate">Звонок</span>
            </a>
          )}

          {telegramField && (
            <a
              href={formatFieldHref(CardFieldType.TELEGRAM, telegramField.value)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition active:scale-95 group ${
                isLightTheme
                  ? 'bg-stone-100/90 hover:bg-stone-200/90 border-stone-200 text-stone-800'
                  : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-200'
              }`}
              title="Написать в Telegram"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center transition group-hover:scale-110">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium mt-1.5 truncate">Telegram</span>
            </a>
          )}

          {whatsappField && (
            <a
              href={formatFieldHref(CardFieldType.WHATSAPP, whatsappField.value)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition active:scale-95 group ${
                isLightTheme
                  ? 'bg-stone-100/90 hover:bg-stone-200/90 border-stone-200 text-stone-800'
                  : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-200'
              }`}
              title="Написать в WhatsApp"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center transition group-hover:scale-110">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium mt-1.5 truncate">WhatsApp</span>
            </a>
          )}

          {emailField && (
            <a
              href={formatFieldHref(CardFieldType.EMAIL, emailField.value)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition active:scale-95 group ${
                isLightTheme
                  ? 'bg-stone-100/90 hover:bg-stone-200/90 border-stone-200 text-stone-800'
                  : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-200'
              }`}
              title="Написать Email"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center transition group-hover:scale-110">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium mt-1.5 truncate">Почта</span>
            </a>
          )}

          {addressField && (
            <a
              href={formatFieldHref(CardFieldType.ADDRESS, addressField.value)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition active:scale-95 group ${
                isLightTheme
                  ? 'bg-stone-100/90 hover:bg-stone-200/90 border-stone-200 text-stone-800'
                  : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-200'
              }`}
              title="Открыть на карте"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center transition group-hover:scale-110">
                <Navigation className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium mt-1.5 truncate">Карта</span>
            </a>
          )}
        </div>

        {/* Primary Call-to-action: Save Contact (vCard) */}
        <div>
          {isPreview ? (
            <div
              className={`w-full py-3.5 px-4 text-center text-xs font-bold uppercase tracking-wider text-white shadow-xl transition flex items-center justify-center gap-2 ${getButtonRadiusClass()}`}
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 8px 24px -4px ${primaryColor}40`,
              }}
            >
              <Download className="w-4 h-4" />
              <span>Сохранить в контакты (.vcf)</span>
            </div>
          ) : (
            <a
              href={`/api/cards/${card.id || card.slug}/vcard`}
              download
              className={`w-full py-4 px-4 text-center text-xs font-bold uppercase tracking-wider text-white shadow-xl transition active:scale-[0.98] flex items-center justify-center gap-2 ${getButtonRadiusClass()}`}
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 8px 24px -4px ${primaryColor}40`,
              }}
            >
              <Download className="w-4 h-4" />
              <span>Сохранить в контакты (.vcf)</span>
            </a>
          )}
        </div>

        {/* Services & Offers (Услуги и спецпредложения) */}
        {theme.services && theme.services.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" style={{ color: primaryColor }} />
              <h2
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLightTheme ? 'text-stone-700' : 'text-stone-300'
                }`}
              >
                Услуги и предложения
              </h2>
            </div>

            <div className="space-y-2.5">
              {theme.services.map((srv, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition ${
                    isLightTheme
                      ? 'bg-stone-100/70 border-stone-200'
                      : 'bg-stone-900/70 border-stone-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3
                        className={`text-xs sm:text-sm font-bold ${
                          isLightTheme ? 'text-stone-900' : 'text-stone-100'
                        }`}
                      >
                        {srv.title}
                      </h3>
                      {srv.desc && (
                        <p
                          className={`text-xs leading-relaxed mt-1 ${
                            isLightTheme ? 'text-stone-600' : 'text-stone-400'
                          }`}
                        >
                          {srv.desc}
                        </p>
                      )}
                    </div>
                    {srv.price && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-xl shrink-0"
                        style={{
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor,
                        }}
                      >
                        {srv.price}
                      </span>
                    )}
                  </div>

                  {srv.link && !isPreview && (
                    <div className="pt-2 mt-2 border-t border-stone-800/40">
                      <a
                        href={srv.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold inline-flex items-center gap-1 hover:underline"
                        style={{ color: primaryColor }}
                      >
                        <span>Подробнее / Заказать</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Requisites / СБП (if enabled) */}
        {theme.paymentRequisites?.enabled && (
          <div
            className={`p-4 rounded-2xl border space-y-2.5 ${
              isLightTheme
                ? 'bg-stone-100/90 border-stone-200'
                : 'bg-stone-900/80 border-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span
                  className={`text-xs font-bold ${
                    isLightTheme ? 'text-stone-800' : 'text-stone-200'
                  }`}
                >
                  Реквизиты для оплаты (СБП)
                </span>
              </div>
              <span className="text-[10px] text-emerald-500 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Без комиссии
              </span>
            </div>

            <div className="space-y-1 text-xs">
              {theme.paymentRequisites.bankName && (
                <div
                  className={`flex justify-between ${
                    isLightTheme ? 'text-stone-600' : 'text-stone-400'
                  }`}
                >
                  <span>Банк:</span>
                  <span className="font-medium text-stone-200">
                    {theme.paymentRequisites.bankName}
                  </span>
                </div>
              )}
              {theme.paymentRequisites.recipientName && (
                <div
                  className={`flex justify-between ${
                    isLightTheme ? 'text-stone-600' : 'text-stone-400'
                  }`}
                >
                  <span>Получатель:</span>
                  <span className="font-medium text-stone-200">
                    {theme.paymentRequisites.recipientName}
                  </span>
                </div>
              )}
              {theme.paymentRequisites.phoneOrCard && (
                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`font-mono font-bold text-xs ${
                      isLightTheme ? 'text-stone-900' : 'text-white'
                    }`}
                  >
                    {theme.paymentRequisites.phoneOrCard}
                  </span>
                  <button
                    onClick={() =>
                      handleCopyRequisites(theme.paymentRequisites!.phoneOrCard!)
                    }
                    className="p-1.5 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 bg-stone-800 border-stone-700 text-stone-200 hover:text-white"
                  >
                    {copiedRequisites ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Скопировать</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              {theme.paymentRequisites.note && (
                <p className="text-[11px] text-stone-400 pt-1">
                  {theme.paymentRequisites.note}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Full Contact List */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isLightTheme ? 'text-stone-600' : 'text-stone-400'
              }`}
            >
              Контакты и ссылки
            </span>
            <span className="text-[11px] text-stone-500">
              {visibleFields.length} записей
            </span>
          </div>

          {visibleFields.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-500">
              Пока нет добавленных контактных данных
            </div>
          ) : (
            visibleFields.map((field, idx) => {
              const href = formatFieldHref(field.type, field.value);
              const isActionable = field.type !== CardFieldType.SCHEDULE;

              return (
                <div key={field.id || idx}>
                  {isActionable && !isPreview ? (
                    <a
                      href={href}
                      target={
                        field.type === CardFieldType.PHONE ||
                        field.type === CardFieldType.EMAIL
                          ? '_self'
                          : '_blank'
                      }
                      rel="noopener noreferrer nofollow ugc"
                      onClick={() => {
                        const targetId = card.id || card.slug;
                        if (targetId) {
                          try {
                            fetch(`/api/cards/${targetId}/click`, {
                              method: 'POST',
                              keepalive: true,
                            }).catch(() => {});
                          } catch {}
                        }
                      }}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border transition active:scale-[0.99] ${
                        isLightTheme
                          ? 'bg-stone-100/80 hover:bg-stone-200/90 border-stone-200'
                          : 'bg-stone-900/70 hover:bg-stone-850 border-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition group-hover:scale-105 shrink-0"
                          style={{
                            backgroundColor: `${primaryColor}20`,
                            color: primaryColor,
                          }}
                        >
                          {getFieldIcon(field.type)}
                        </div>
                        <div className="text-left overflow-hidden">
                          <div
                            className={`text-[11px] font-medium ${
                              isLightTheme ? 'text-stone-500' : 'text-stone-400'
                            }`}
                          >
                            {field.label}
                          </div>
                          <div
                            className={`text-xs font-medium truncate max-w-[190px] sm:max-w-[250px] ${
                              isLightTheme ? 'text-stone-900' : 'text-stone-100'
                            }`}
                          >
                            {field.value}
                          </div>
                        </div>
                      </div>
                      <ExternalLink
                        className={`w-3.5 h-3.5 transition shrink-0 ml-2 ${
                          isLightTheme
                            ? 'text-stone-400 group-hover:text-stone-700'
                            : 'text-stone-500 group-hover:text-stone-300'
                        }`}
                      />
                    </a>
                  ) : (
                    <div
                      className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                        isLightTheme
                          ? 'bg-stone-100/80 border-stone-200'
                          : 'bg-stone-900/70 border-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${primaryColor}20`,
                            color: primaryColor,
                          }}
                        >
                          {getFieldIcon(field.type)}
                        </div>
                        <div className="text-left overflow-hidden">
                          <div
                            className={`text-[11px] font-medium ${
                              isLightTheme ? 'text-stone-500' : 'text-stone-400'
                            }`}
                          >
                            {field.label}
                          </div>
                          <div
                            className={`text-xs font-medium truncate max-w-[190px] sm:max-w-[250px] ${
                              isLightTheme ? 'text-stone-900' : 'text-stone-100'
                            }`}
                          >
                            {field.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & Report button */}
        {!isPreview && (
          <div
            className={`pt-4 border-t flex items-center justify-between text-[11px] ${
              isLightTheme
                ? 'border-stone-200 text-stone-500'
                : 'border-stone-800/80 text-stone-500'
            }`}
          >
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              NFC CardHub
            </span>

            {onOpenReport && (
              <button
                onClick={onOpenReport}
                className="hover:text-rose-400 transition flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Пожаловаться</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
