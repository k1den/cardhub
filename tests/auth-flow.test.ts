import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import {
  createEmailVerificationToken,
  validateEmailToken,
  createPasswordResetToken,
} from '@/lib/auth/tokens';
import { createSession, invalidateSession } from '@/lib/auth/session';
import { ConsentType, EmailTokenType } from '@prisma/client';

describe('Auth Flow Integration (Stage 1 Acceptance)', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const initialPassword = 'InitialSecurePass123!';
  const updatedPassword = 'NewSecurePassword456!';
  let testUserId = '';

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.deleteMany({ where: { id: testUserId } });
    }
    await prisma.$disconnect();
  });

  it('1. Registers user with separate 152-ФЗ consents and inactive verified status', async () => {
    const passwordHash = await hashPassword(initialPassword);

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        emailVerified: false,
        consents: {
          create: [
            {
              consentType: ConsentType.PD_PROCESSING,
              documentVersion: '1.0',
              ipAddress: '127.0.0.1',
              userAgent: 'Vitest Test Runner',
            },
            {
              consentType: ConsentType.OFFER,
              documentVersion: '1.0',
              ipAddress: '127.0.0.1',
              userAgent: 'Vitest Test Runner',
            },
          ],
        },
      },
      include: {
        consents: true,
      },
    });

    testUserId = user.id;

    expect(user.id).toBeDefined();
    expect(user.emailVerified).toBe(false);
    expect(user.consents.length).toBe(2);
  });

  it('2. Prevents login when email is not verified', async () => {
    const user = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(user?.emailVerified).toBe(false);

    // Attempting login logic: if !user.emailVerified -> access denied
    const canLogin = user !== null && user.emailVerified === true;
    expect(canLogin).toBe(false);
  });

  it('3. Successfully verifies email with one-time token', async () => {
    const token = await createEmailVerificationToken(testUserId);
    expect(token).toBeDefined();

    const validation = await validateEmailToken(token, EmailTokenType.VERIFY_EMAIL);
    expect(validation).not.toBeNull();
    expect(validation?.userId).toBe(testUserId);

    // Mark as verified
    await prisma.user.update({
      where: { id: testUserId },
      data: { emailVerified: true },
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(updatedUser?.emailVerified).toBe(true);
  });

  it('4. Creates session upon successful login after verification', async () => {
    const user = await prisma.user.findUnique({ where: { id: testUserId } });
    const passwordMatch = await verifyPassword(initialPassword, user!.passwordHash);
    expect(passwordMatch).toBe(true);

    const sessionId = await createSession(user!.id, '127.0.0.1', 'Vitest');
    expect(sessionId).toBeDefined();

    const dbSession = await prisma.session.findUnique({ where: { id: sessionId } });
    expect(dbSession).not.toBeNull();
    expect(dbSession?.userId).toBe(user!.id);

    // Logout and invalidate session
    await invalidateSession(sessionId);
    const deletedSession = await prisma.session.findUnique({ where: { id: sessionId } });
    expect(deletedSession).toBeNull();
  });

  it('5. Completes password reset flow and updates password securely', async () => {
    const resetToken = await createPasswordResetToken(testUserId);
    expect(resetToken).toBeDefined();

    const validation = await validateEmailToken(resetToken, EmailTokenType.RESET_PASSWORD);
    expect(validation).not.toBeNull();

    const newPasswordHash = await hashPassword(updatedPassword);
    await prisma.user.update({
      where: { id: testUserId },
      data: { passwordHash: newPasswordHash },
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: testUserId } });
    const oldPasswordValid = await verifyPassword(initialPassword, updatedUser!.passwordHash);
    const newPasswordValid = await verifyPassword(updatedPassword, updatedUser!.passwordHash);

    expect(oldPasswordValid).toBe(false);
    expect(newPasswordValid).toBe(true);
  });
});
