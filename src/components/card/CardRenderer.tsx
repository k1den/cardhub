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

export interface CardRenderData {
  id?: string;
  slug: string;
  fullName: string;
  position?: string | null;
  companyName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  templateId: 'modern' | 'minimal' | 'corporate';
  themeConfig?: {
    primaryColor?: string;
    fontFamily?: 'sans' | 'serif' | 'mono';
    layout?: 'standard' | 'compact' | 'expanded';
  };
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
  const [copied, setCopied] = useState(false);

  const primaryColor = card.themeConfig?.primaryColor || card.company?.brandColor || '#3b82f6';
  const fontFamily = card.themeConfig?.fontFamily || 'sans';
  const template = card.templateId || 'modern';

  // Visible fields only
  const visibleFields = card.fields
    .filter((f) => f.visible && f.value.trim().length > 0)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const fontClass =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.fullName,
          text: `Цифровая визитка: ${card.fullName}`,
          url,
        });
      } catch {
        // Fallback to copy
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
      default:
        return val.startsWith('http') ? val : `https://${val}`;
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto min-h-[580px] rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-300 ${fontClass} ${
        template === 'minimal'
          ? 'bg-slate-900 border border-slate-800 text-slate-100'
          : template === 'corporate'
          ? 'bg-slate-950 border border-slate-800 text-white'
          : 'glass-panel border border-slate-800/80 text-white'
      }`}
    >
      {/* Cover Banner */}
      <div
        className="h-32 sm:h-36 w-full relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900"
        style={{
          background: card.coverUrl
            ? `url(${card.coverUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${primaryColor}33, #0f172a)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90" />
      </div>

      {/* Profile Section */}
      <div className="px-6 relative -mt-16 pb-6 space-y-5">
        <div className="flex items-end justify-between">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-950 shadow-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-white text-3xl font-black"
              style={{
                boxShadow: `0 8px 24px ${primaryColor}25`,
              }}
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

          {/* Quick Action Icons */}
          {!isPreview && (
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                title="Поделиться визиткой"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              {onOpenQr && (
                <button
                  onClick={onOpenQr}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                  title="Показать QR-код"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Name and Titles */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-white">{card.fullName}</h1>
          {(card.position || card.companyName || card.company?.name) && (
            <p className="text-xs font-medium text-slate-300 flex flex-wrap items-center gap-1.5">
              {card.position && <span>{card.position}</span>}
              {card.position && (card.companyName || card.company?.name) && <span className="text-slate-600">•</span>}
              {(card.companyName || card.company?.name) && (
                <span className="font-semibold inline-flex items-center gap-1" style={{ color: primaryColor }}>
                  {card.company?.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.company.logoUrl}
                      alt={card.company.name}
                      className="w-3.5 h-3.5 rounded object-contain inline-block"
                    />
                  )}
                  <span>{card.companyName || card.company?.name}</span>
                </span>
              )}
            </p>
          )}
        </div>

        {/* Bio */}
        {card.bio && (
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
            {card.bio}
          </p>
        )}

        {/* Primary Call-to-action: Save Contact (vCard) */}
        <div>
          {isPreview ? (
            <div
              className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg transition flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Download className="w-4 h-4" />
              <span>Сохранить в контакты</span>
            </div>
          ) : (
            <a
              href={`/api/cards/${card.id || card.slug}/vcard`}
              download
              className="w-full py-3.5 px-4 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-white shadow-xl transition active:scale-[0.99] flex items-center justify-center gap-2"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 8px 24px -4px ${primaryColor}50`,
              }}
            >
              <Download className="w-4 h-4" />
              <span>Сохранить в контакты (.vcf)</span>
            </a>
          )}
        </div>

        {/* Contact & Social Links List */}
        <div className="space-y-2 pt-1">
          {visibleFields.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              Пока нет добавленных контактных данных
            </div>
          ) : (
            visibleFields.map((field, idx) => {
              const href = formatFieldHref(field.type, field.value);
              const isActionable = field.type !== CardFieldType.ADDRESS && field.type !== CardFieldType.SCHEDULE;

              return (
                <div key={field.id || idx}>
                  {isActionable && !isPreview ? (
                    <a
                      href={href}
                      target={field.type === CardFieldType.PHONE || field.type === CardFieldType.EMAIL ? '_self' : '_blank'}
                      rel="noopener noreferrer nofollow ugc"
                      onClick={() => {
                        const targetId = card.id || card.slug;
                        if (targetId) {
                          try {
                            fetch(`/api/cards/${targetId}/click`, { method: 'POST', keepalive: true }).catch(() => {});
                          } catch {}
                        }
                      }}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition group-hover:scale-105"
                          style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
                        >
                          {getFieldIcon(field.type)}
                        </div>
                        <div className="text-left">
                          <div className="text-[11px] text-slate-400 font-medium">{field.label}</div>
                          <div className="text-xs font-medium text-slate-200 truncate max-w-[210px]">
                            {field.value}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition" />
                    </a>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
                        >
                          {getFieldIcon(field.type)}
                        </div>
                        <div className="text-left">
                          <div className="text-[11px] text-slate-400 font-medium">{field.label}</div>
                          <div className="text-xs font-medium text-slate-200 truncate max-w-[210px]">
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

        {/* Footer actions on public card */}
        {!isPreview && (
          <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              NFC CardHub
            </span>

            {onOpenReport && (
              <button
                onClick={onOpenReport}
                className="hover:text-rose-400 transition flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                Пожаловаться
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
