import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { invalidateSession, removeSessionCookie, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionId) {
      await invalidateSession(sessionId);
    }
    await removeSessionCookie();

    return NextResponse.json({ success: true, message: 'Сессия завершена' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Ошибка при выходе' }, { status: 500 });
  }
}
