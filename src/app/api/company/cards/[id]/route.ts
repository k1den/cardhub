import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { companyService } from '@/lib/company/service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { id: cardId } = await params;
    const body = await req.json();
    const { companyId, fullName, position, companyName, bio, published } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'Не указан companyId' }, { status: 400 });
    }

    const updated = await companyService.editEmployeeCard(session.user.id, companyId, cardId, {
      fullName,
      position,
      companyName,
      bio,
      published,
    });

    return NextResponse.json({
      success: true,
      card: updated,
    });
  } catch (error: any) {
    console.error('Edit employee card error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при редактировании визитки сотрудника' },
      { status: 400 }
    );
  }
}
