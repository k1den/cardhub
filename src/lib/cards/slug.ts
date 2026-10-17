import crypto from 'node:crypto';

export const RESERVED_SLUGS = new Set([
  'admin',
  'administrator',
  'api',
  'app',
  'auth',
  'billing',
  'c',
  'card',
  'cards',
  'company',
  'companies',
  'dashboard',
  'dev',
  'download',
  'edit',
  'email',
  'help',
  'home',
  'legal',
  'login',
  'logout',
  'me',
  'nfc',
  'offer',
  'payment',
  'privacy',
  'profile',
  'qr',
  'register',
  'report',
  'reset',
  'root',
  'security',
  'settings',
  'signin',
  'signup',
  'stats',
  'subscription',
  'support',
  'terms',
  'vcard',
  'verify',
]);

const ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates an 8-character random slug using crypto.
 */
export function generateRandomSlug(length = 8): string {
  const bytes = crypto.randomBytes(length);
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length];
  }
  return slug;
}

/**
 * Checks if a slug is a reserved system path.
 */
export function isSlugReserved(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase().trim());
}

/**
 * Validates custom readable slugs (Pro tier):
 * - 3 to 32 characters
 * - Only lowercase latin letters, digits, and hyphens
 * - Cannot start or end with hyphen
 * - Cannot be in reserved list
 */
export function isValidCustomSlug(slug: string): { valid: boolean; error?: string } {
  const trimmed = slug.toLowerCase().trim();

  if (trimmed.length < 3 || trimmed.length > 32) {
    return { valid: false, error: 'Адрес визитки должен содержать от 3 до 32 символов' };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Адрес может содержать только латинские буквы, цифры и дефисы (без дефисов в начале и конце)',
    };
  }

  if (isSlugReserved(trimmed)) {
    return { valid: false, error: 'Этот адрес зарезервирован системой. Пожалуйста, выберите другой.' };
  }

  return { valid: true };
}
