import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      ),
      session: null,
    };
  }

  if (session.user.role !== 'ADMIN') {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Доступ запрещен. Требуются права администратора платформы.' },
        { status: 403 }
      ),
      session: null,
    };
  }

  return {
    authorized: true as const,
    response: null,
    session,
  };
}
