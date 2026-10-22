import { z } from 'zod';
import { isSafeUrl } from '@/lib/cards/url-validator';
import { CardFieldType } from '@prisma/client';

export const cardFieldSchema = z.object({
  id: z.string().optional(),
  type: z.nativeEnum(CardFieldType),
  label: z.string().max(64, 'Название поля не должно превышать 64 символа'),
  value: z
    .string()
    .min(1, 'Значение не может быть пустым')
    .max(500, 'Слишком длинное значение')
    .refine((val) => {
      // Validate URLs to reject javascript:, data:, etc.
      if (/^[a-zA-Z0-9+.-]+:/.test(val.trim())) {
        return isSafeUrl(val);
      }
      return true;
    }, 'Недопустимый формат ссылки или опасный протокол'),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const themeConfigSchema = z
  .object({
    primaryColor: z.string().default('#c25e00'),
    secondaryColor: z.string().optional().nullable(),
    fontFamily: z.enum(['sans', 'serif', 'mono', 'display', 'rounded']).default('sans'),
    layout: z.enum(['standard', 'compact', 'expanded']).default('standard'),
    cardSurface: z.enum(['dark', 'light', 'warm_paper', 'graphite', 'glass']).default('dark'),
    cardTexture: z.enum(['smooth', 'gradient', 'mesh', 'dots', 'grid', 'carbon', 'linen']).default('smooth'),
    avatarShape: z.enum(['squircle', 'circle', 'rounded', 'portrait']).default('squircle'),
    avatarBorder: z.enum(['accent', 'thin', 'none', 'double', 'glow']).default('accent'),
    buttonStyle: z.enum(['rounded', 'pill', 'sharp', 'glass', 'outline']).default('rounded'),
    coverStyle: z.enum(['banner', 'compact', 'gradient', 'minimal']).default('banner'),
    statusBadge: z
      .object({
        enabled: z.boolean().default(false),
        text: z.string().max(80).default(''),
        color: z.string().default('emerald'),
      })
      .optional()
      .nullable(),
    tags: z.array(z.string().max(50)).default([]),
    services: z
      .array(
        z.object({
          title: z.string().max(100),
          desc: z.string().max(300).optional().nullable(),
          price: z.string().max(50).optional().nullable(),
          link: z.string().max(500).optional().nullable(),
        })
      )
      .default([]),
    highlights: z
      .array(
        z.object({
          label: z.string().max(50),
          value: z.string().max(50),
        })
      )
      .default([]),
    paymentRequisites: z
      .object({
        enabled: z.boolean().default(false),
        bankName: z.string().max(80).optional().nullable(),
        recipientName: z.string().max(120).optional().nullable(),
        phoneOrCard: z.string().max(60).optional().nullable(),
        note: z.string().max(150).optional().nullable(),
      })
      .optional()
      .nullable(),
  })
  .passthrough();

export const DEFAULT_THEME_CONFIG = {
  primaryColor: '#c25e00',
  secondaryColor: null as string | null,
  fontFamily: 'sans' as const,
  layout: 'standard' as const,
  cardSurface: 'dark' as const,
  cardTexture: 'smooth' as const,
  avatarShape: 'squircle' as const,
  avatarBorder: 'accent' as const,
  buttonStyle: 'rounded' as const,
  coverStyle: 'banner' as const,
  statusBadge: null,
  tags: [] as string[],
  services: [] as Array<{ title: string; desc?: string | null; price?: string | null; link?: string | null }>,
  highlights: [] as Array<{ label: string; value: string }>,
  paymentRequisites: null,
};

export const cardFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Имя должно содержать не менее 2 символов')
    .max(100, 'Имя не должно превышать 100 символов'),
  position: z.string().max(100, 'Должность не должна превышать 100 символов').optional().nullable(),
  companyName: z.string().max(100, 'Название компании не должно превышать 100 символов').optional().nullable(),
  bio: z.string().max(1000, 'Описание не должно превышать 1000 символов').optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable(),
  coverUrl: z.string().max(500).optional().nullable(),
  templateId: z.string().default('warm_editorial'),
  themeConfig: themeConfigSchema.default(DEFAULT_THEME_CONFIG),
  slug: z.string().optional().nullable(),
  published: z.boolean().default(true),
  isIndexed: z.boolean().default(false),
  fields: z.array(cardFieldSchema).default([]),
});

export type CardFormInput = z.infer<typeof cardFormSchema>;
export type CardFieldInput = z.infer<typeof cardFieldSchema>;
