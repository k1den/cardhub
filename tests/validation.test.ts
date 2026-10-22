import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, resetPasswordSchema } from '@/lib/validations/auth';

describe('Auth Validation Schemas & 152-ФЗ Compliance', () => {
  it('validates correct registration data with all mandatory consents', () => {
    const validData = {
      email: 'User@Example.COM ',
      password: 'SecurePassword123!',
      consentPdProcessing: true,
      consentOffer: true,
      consentMarketing: false,
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.consentPdProcessing).toBe(true);
      expect(result.data.consentOffer).toBe(true);
    }
  });

  it('rejects registration without personal data processing consent (152-ФЗ)', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'SecurePassword123!',
      consentPdProcessing: false, // rejected!
      consentOffer: true,
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects registration without offer acceptance', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'SecurePassword123!',
      consentPdProcessing: true,
      consentOffer: false, // rejected!
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('enforces password policy (min 10 chars, uppercase, digit)', () => {
    // Too short (< 10 chars)
    expect(
      registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Short1!',
        consentPdProcessing: true,
        consentOffer: true,
      }).success
    ).toBe(false);

    // No uppercase
    expect(
      registerSchema.safeParse({
        email: 'test@example.com',
        password: 'lowercaseonly123',
        consentPdProcessing: true,
        consentOffer: true,
      }).success
    ).toBe(false);

    // No digit
    expect(
      registerSchema.safeParse({
        email: 'test@example.com',
        password: 'NoDigitsInPasswordHere',
        consentPdProcessing: true,
        consentOffer: true,
      }).success
    ).toBe(false);
  });
});

describe('Card Customization & Rich Schema Validation', () => {
  it('validates rich card configuration with themes, tags, services, highlights and payment requisites', async () => {
    const { cardFormSchema } = await import('@/lib/validations/card');

    const richCardData = {
      fullName: 'Алексей Морозов',
      position: 'Ведущий брокер по недвижимости',
      companyName: 'Prime Realty',
      bio: 'Помощь в подборе премиальной недвижимости в Москве и Сочи.',
      templateId: 'warm_editorial',
      themeConfig: {
        primaryColor: '#d97706',
        fontFamily: 'serif',
        layout: 'standard',
        cardTexture: 'mesh',
        avatarShape: 'squircle',
        avatarBorder: 'accent',
        buttonStyle: 'rounded',
        coverStyle: 'banner',
        statusBadge: {
          enabled: true,
          text: '🟢 На связи онлайн',
          color: 'emerald',
        },
        tags: ['Недвижимость', 'Ипотека 6%', 'Инвестиции'],
        highlights: [
          { label: 'Опыт в сфере', value: '10+ лет' },
          { label: 'Сделок', value: '450+' },
        ],
        services: [
          {
            title: 'Подбор новостроек',
            desc: 'Полное юридическое сопровождение',
            price: 'Бесплатно',
          },
        ],
        paymentRequisites: {
          enabled: true,
          bankName: 'Т-Банк',
          recipientName: 'Алексей М.',
          phoneOrCard: '+7 (999) 123-45-67',
          note: 'СБП без комиссии',
        },
      },
      fields: [
        {
          type: 'PHONE',
          label: 'Телефон',
          value: '+7 (999) 123-45-67',
          visible: true,
          sortOrder: 0,
        },
        {
          type: 'TELEGRAM',
          label: 'Telegram',
          value: '@alexey_realty',
          visible: true,
          sortOrder: 1,
        },
      ],
    };

    const result = cardFormSchema.safeParse(richCardData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.templateId).toBe('warm_editorial');
      expect((result.data.themeConfig as any).tags).toHaveLength(3);
      expect((result.data.themeConfig as any).services).toHaveLength(1);
      expect((result.data.themeConfig as any).statusBadge.text).toBe('🟢 На связи онлайн');
      expect((result.data.themeConfig as any).paymentRequisites.enabled).toBe(true);
    }
  });
});

