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
