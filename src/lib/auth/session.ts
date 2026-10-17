import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

export const SESSION_COOKIE_NAME = 'cardhub_session';
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionData {
  sessionId: string;
  user: Omit<User, 'passwordHash'>;
}

export async function createSession(
  userId: string,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt,
    },
  });

  return sessionId;
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionToken },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (new Date() > session.expiresAt || session.user.deletedAt) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...userWithoutPassword } = session.user;

  return {
    sessionId: session.id,
    user: userWithoutPassword,
  };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { id: sessionId },
  });
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}
