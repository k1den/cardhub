import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Argon2id Password Security', () => {
  it('correctly hashes and verifies a strong password', async () => {
    const password = 'StrongPassword123!';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('rejects incorrect passwords', async () => {
    const password = 'StrongPassword123!';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword('WrongPassword123!', hash);
    expect(isValid).toBe(false);
  });
});
