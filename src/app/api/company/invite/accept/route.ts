import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { companyService } from '@/lib/company/service';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Для принятия приглашения необходимо войти в систему или зарегистрироваться', requiresAuth: true },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { token, consentGiven } = body;

    if (!token) {
      return NextResponse.json({ error: 'Не указан токен приглашения' }, { status: 400 });
    }

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Необходимо подтвердить согласие на управление вашей визиткой администратором компании' },
        { status: 400 }
      );
    }

    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const ipAddress = forwardedFor.split(',')[0]?.trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const membership = await companyService.acceptInvitation(
      session.user.id,
      token,
      Boolean(consentGiven),
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      membership,
    });
  } catch (error: any) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при принятии приглашения' },
      { status: 400 }
    );
  }
}
