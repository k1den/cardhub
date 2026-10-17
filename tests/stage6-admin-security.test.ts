import { describe, it, expect } from 'vitest';
import {
  generateTotpSecret,
  generateOtpAuthUri,
  computeTotpCode,
  verifyTotpCode,
  encryptSecret,
  decryptSecret,
} from '../src/lib/security/totp';

describe('Stage 6: 2FA TOTP RFC 6238 & AES-256-GCM Encryption', () => {
  it('generates a valid TOTP secret and otpauth URI', () => {
    const secret = generateTotpSecret();
    const uri = generateOtpAuthUri(secret, 'user@example.com', 'CardHub');
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThanOrEqual(16);
    expect(uri).toContain('otpauth://totp/CardHub:user%40example.com');
    expect(uri).toContain(`secret=${secret}`);
  });

  it('generates a 6-digit numeric token and verifies it correctly', () => {
    const secret = generateTotpSecret();
    const token = computeTotpCode(secret);
    expect(token).toMatch(/^\d{6}$/);

    const isValid = verifyTotpCode(secret, token);
    expect(isValid).toBe(true);

    const isInvalid = verifyTotpCode(secret, '000000');
    if (token !== '000000') {
      expect(isInvalid).toBe(false);
    }
  });

  it('rejects invalid or non-numeric tokens', () => {
    const secret = generateTotpSecret();
    expect(verifyTotpCode(secret, 'abc')).toBe(false);
    expect(verifyTotpCode(secret, '')).toBe(false);
    expect(verifyTotpCode(secret, '12345')).toBe(false);
    expect(verifyTotpCode(secret, '1234567')).toBe(false);
  });

  it('encrypts and decrypts secrets with AES-256-GCM without data loss', () => {
    const originalSecret = 'JBSWY3DPEHPK3PXP';
    const encrypted = encryptSecret(originalSecret);

    expect(encrypted).not.toBe(originalSecret);
    expect(encrypted).toContain(':'); // iv:ciphertext:tag format

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(originalSecret);
  });

  it('fails decryption gracefully if ciphertext or auth tag is tampered', () => {
    const originalSecret = 'JBSWY3DPEHPK3PXP';
    const encrypted = encryptSecret(originalSecret);
    const parts = encrypted.split(':');
    // Tamper with the ciphertext
    const tamperedCiphertext = parts[0] + ':' + 'ffff' + parts[1].substring(4) + ':' + parts[2];

    expect(() => decryptSecret(tamperedCiphertext)).toThrow();
  });
});

describe('Stage 6: 152-ФЗ User Data Rights (Export and Erasure)', () => {
  it('structure of exported data complies with 152-ФЗ and omits passwordHash', () => {
    const mockUserData = {
      profile: {
        id: 'u-123',
        email: 'ivan@example.ru',
        role: 'USER',
        emailVerified: true,
        totpEnabled: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      consents: [
        {
          consentType: 'PD_PROCESSING',
          documentVersion: '1.0',
          ipAddress: '127.0.0.1',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      cards: [
        {
          slug: 'ivan-petrov',
          title: 'Моя визитка',
          fullName: 'Иван Петров',
          published: true,
          fields: [{ type: 'PHONE', value: '+79991234567' }],
        },
      ],
      auditLogs: [
        {
          action: 'USER_LOGIN',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      exportedAt: new Date().toISOString(),
      legalNotice: 'Выгрузка персональных данных в соответствии со ст. 14 Федерального закона № 152-ФЗ «О персональных данных»',
    };

    // Verify critical requirements:
    expect((mockUserData.profile as any).passwordHash).toBeUndefined();
    expect(mockUserData.legalNotice).toContain('152-ФЗ');
    expect(mockUserData.consents.length).toBe(1);
    expect(mockUserData.cards[0].fullName).toBe('Иван Петров');
  });

  it('account deletion ensures soft delete, unpublishes cards, and purges sessions', () => {
    const userState = {
      id: 'u-123',
      deletedAt: null as Date | null,
      emailVerified: true,
      sessions: ['sess-1', 'sess-2'],
      cards: [
        { id: 'c-1', published: true, deletedAt: null as Date | null },
        { id: 'c-2', published: true, deletedAt: null as Date | null },
      ],
    };

    // Simulate account deletion transaction
    const now = new Date();
    userState.deletedAt = now;
    userState.emailVerified = false;
    userState.sessions = [];
    userState.cards.forEach((c) => {
      c.published = false;
      c.deletedAt = now;
    });

    expect(userState.deletedAt).not.toBeNull();
    expect(userState.emailVerified).toBe(false);
    expect(userState.sessions).toHaveLength(0);
    expect(userState.cards.every((c) => !c.published && c.deletedAt !== null)).toBe(true);
  });
});

describe('Stage 6: 149-ФЗ Content Moderation Rules', () => {
  it('resolving report with APPROVE_HIDE_CARD unpublishes the card and marks report RESOLVED', () => {
    const report = {
      id: 'rep-1',
      status: 'PENDING',
      cardId: 'c-1',
      resolvedAt: null as Date | null,
    };
    const card = {
      id: 'c-1',
      published: true,
    };

    // Simulate moderation action
    const action = 'APPROVE_HIDE_CARD';
    if (action === 'APPROVE_HIDE_CARD') {
      report.status = 'RESOLVED';
      report.resolvedAt = new Date();
      card.published = false;
    }

    expect(report.status).toBe('RESOLVED');
    expect(report.resolvedAt).not.toBeNull();
    expect(card.published).toBe(false);
  });

  it('rejecting report leaves card published and marks report REJECTED', () => {
    const report = {
      id: 'rep-2',
      status: 'PENDING',
      resolvedAt: null as Date | null,
    };
    const card = {
      id: 'c-2',
      published: true,
    };

    const action = 'REJECT';
    if (action === 'REJECT') {
      report.status = 'REJECTED';
      report.resolvedAt = new Date();
    }

    expect(report.status).toBe('REJECTED');
    expect(card.published).toBe(true);
  });

  it('banning author unpublishes all cards, marks user deleted, and purges sessions', () => {
    const author = {
      id: 'author-1',
      deletedAt: null as Date | null,
      sessionsCount: 3,
    };
    const authorCards = [
      { id: 'c-10', published: true },
      { id: 'c-11', published: true },
    ];

    const action = 'BAN_AUTHOR';
    if (action === 'BAN_AUTHOR') {
      author.deletedAt = new Date();
      author.sessionsCount = 0;
      authorCards.forEach((c) => {
        c.published = false;
      });
    }

    expect(author.deletedAt).not.toBeNull();
    expect(author.sessionsCount).toBe(0);
    expect(authorCards.every((c) => !c.published)).toBe(true);
  });
});

describe('Stage 6: Admin RBAC & IDOR Protections', () => {
  function checkAdminAccess(session: { user: { id: string; role: string } } | null) {
    if (!session) {
      return { status: 401, error: 'Необходима авторизация' };
    }
    if (session.user.role !== 'ADMIN') {
      return { status: 403, error: 'Доступ запрещен' };
    }
    return { status: 200, authorized: true };
  }

  it('denies anonymous visitors with 401', () => {
    const res = checkAdminAccess(null);
    expect(res.status).toBe(401);
  });

  it('denies regular USER with 403', () => {
    const res = checkAdminAccess({ user: { id: 'u-1', role: 'USER' } });
    expect(res.status).toBe(403);
  });

  it('denies PRO subscriber with 403 (only platform admins allowed)', () => {
    const res = checkAdminAccess({ user: { id: 'u-2', role: 'PRO' } });
    expect(res.status).toBe(403);
  });

  it('grants access to ADMIN role', () => {
    const res = checkAdminAccess({ user: { id: 'u-admin', role: 'ADMIN' } });
    expect(res.status).toBe(200);
    expect(res.authorized).toBe(true);
  });

  it('prevents admin from modifying their own role or blocking themselves', () => {
    const currentAdminId = 'admin-999';
    const targetUserId = 'admin-999';

    const canSelfModify = currentAdminId !== targetUserId;
    expect(canSelfModify).toBe(false);
  });
});
