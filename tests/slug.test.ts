import { describe, it, expect } from 'vitest';
import { generateRandomSlug, isSlugReserved, isValidCustomSlug } from '@/lib/cards/slug';

describe('Slug Generation and Reserved Words', () => {
  it('generates random 8-character alphanumeric slugs', () => {
    const slug1 = generateRandomSlug(8);
    const slug2 = generateRandomSlug(8);

    expect(slug1.length).toBe(8);
    expect(slug2.length).toBe(8);
    expect(slug1).not.toBe(slug2);
    expect(/^[a-z0-9]{8}$/.test(slug1)).toBe(true);
  });

  it('detects reserved system slugs', () => {
    expect(isSlugReserved('admin')).toBe(true);
    expect(isSlugReserved('api')).toBe(true);
    expect(isSlugReserved('dashboard')).toBe(true);
    expect(isSlugReserved('legal')).toBe(true);
    expect(isSlugReserved('alex-smirnov')).toBe(false);
  });

  it('validates custom slugs for Pro users', () => {
    expect(isValidCustomSlug('my-company').valid).toBe(true);
    expect(isValidCustomSlug('ivan99').valid).toBe(true);

    // Too short (< 3)
    expect(isValidCustomSlug('ab').valid).toBe(false);

    // Invalid symbols
    expect(isValidCustomSlug('my_company').valid).toBe(false);
    expect(isValidCustomSlug('-lead-').valid).toBe(false);

    // Reserved word
    expect(isValidCustomSlug('admin').valid).toBe(false);
  });
});
