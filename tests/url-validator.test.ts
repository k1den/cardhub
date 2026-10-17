import { describe, it, expect } from 'vitest';
import { isSafeUrl, formatSocialUrl } from '@/lib/cards/url-validator';

describe('URL Safety & Protocol Validation', () => {
  it('allows safe protocols (https, http, tel, mailto)', () => {
    expect(isSafeUrl('https://cardhub.local/portfolio')).toBe(true);
    expect(isSafeUrl('http://my-company.ru')).toBe(true);
    expect(isSafeUrl('tel:+79991234567')).toBe(true);
    expect(isSafeUrl('mailto:info@cardhub.local')).toBe(true);
    expect(isSafeUrl('example.com/blog')).toBe(true);
  });

  it('strictly blocks dangerous and executable URL schemes', () => {
    expect(isSafeUrl('javascript:alert(document.cookie)')).toBe(false);
    expect(isSafeUrl('JAVASCRIPT:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeUrl('vbscript:msgbox("XSS")')).toBe(false);
    expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeUrl('about:blank')).toBe(false);
  });

  it('correctly normalizes social and messenger inputs', () => {
    expect(formatSocialUrl('TELEGRAM', '@alex_dev')).toBe('https://t.me/alex_dev');
    expect(formatSocialUrl('TELEGRAM', 'https://t.me/alex_dev')).toBe('https://t.me/alex_dev');
    expect(formatSocialUrl('WHATSAPP', '+7 (999) 123-45-67')).toBe('https://wa.me/79991234567');
    expect(formatSocialUrl('VK', 'alex_profile')).toBe('https://vk.com/alex_profile');
    expect(formatSocialUrl('PHONE', '+7 (999) 111-22-33')).toBe('tel:+79991112233');
    expect(formatSocialUrl('EMAIL', 'User@Example.COM ')).toBe('mailto:user@example.com');
  });
});
