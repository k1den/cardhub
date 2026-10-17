import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { companyService } from '@/lib/company/service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Не указан companyId' }, { status: 400 });
    }

    await companyService.cancelInvitation(session.user.id, companyId, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel invitation error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при отмене приглашения' },
      { status: 400 }
    );
  }
}
