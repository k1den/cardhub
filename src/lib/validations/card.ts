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
  templateId: z.enum(['modern', 'minimal', 'corporate']).default('modern'),
  themeConfig: z
    .object({
      primaryColor: z.string().default('#3b82f6'),
      fontFamily: z.enum(['sans', 'serif', 'mono']).default('sans'),
      layout: z.enum(['standard', 'compact', 'expanded']).default('standard'),
    })
    .default({
      primaryColor: '#3b82f6',
      fontFamily: 'sans',
      layout: 'standard',
    }),
  slug: z.string().optional().nullable(),
  published: z.boolean().default(true),
  isIndexed: z.boolean().default(false),
  fields: z.array(cardFieldSchema).default([]),
});

export type CardFormInput = z.infer<typeof cardFormSchema>;
export type CardFieldInput = z.infer<typeof cardFieldSchema>;
