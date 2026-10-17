import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { EmailTokenType } from '@prisma/client';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

/**
 * Creates an email verification token with 24 hours expiry.
 */
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const { token, tokenHash } = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Invalidate any existing verification tokens for this user
  await prisma.emailToken.deleteMany({
    where: {
      userId,
      type: EmailTokenType.VERIFY_EMAIL,
    },
  });

  await prisma.emailToken.create({
    data: {
      userId,
      type: EmailTokenType.VERIFY_EMAIL,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

/**
 * Creates a password reset token with 30 minutes expiry (per TZ 4.1).
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const { token, tokenHash } = generateSecureToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Invalidate previous reset tokens
  await prisma.emailToken.deleteMany({
    where: {
      userId,
      type: EmailTokenType.RESET_PASSWORD,
    },
  });

  await prisma.emailToken.create({
    data: {
      userId,
      type: EmailTokenType.RESET_PASSWORD,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

/**
 * Validates token and returns corresponding user ID if valid.
 */
export async function validateEmailToken(
  token: string,
  type: EmailTokenType
): Promise<{ userId: string; tokenId: string } | null> {
  const tokenHash = hashToken(token);

  const tokenRecord = await prisma.emailToken.findUnique({
    where: { tokenHash },
  });

  if (!tokenRecord || tokenRecord.type !== type) {
    return null;
  }

  if (new Date() > tokenRecord.expiresAt) {
    await prisma.emailToken.delete({ where: { id: tokenRecord.id } });
    return null;
  }

  return { userId: tokenRecord.userId, tokenId: tokenRecord.id };
}
