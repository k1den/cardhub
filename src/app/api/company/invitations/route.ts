import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { companyService } from '@/lib/company/service';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const { companyId, email } = body;

    if (!companyId || !email) {
      return NextResponse.json({ error: 'Укажите email сотрудника' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Некорректный формат email' }, { status: 400 });
    }

    const result = await companyService.createInvitation(session.user.id, companyId, email);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/invite/${result.token}`;

    return NextResponse.json({
      success: true,
      invitation: result.invitation,
      inviteUrl,
      expiresAt: result.expiresAt,
    });
  } catch (error: any) {
    console.error('Create invitation error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при отправке приглашения' },
      { status: 400 }
    );
  }
}
