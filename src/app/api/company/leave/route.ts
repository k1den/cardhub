import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { companyService } from '@/lib/company/service';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    await companyService.leaveCompany(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Leave company error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при выходе из компании' },
      { status: 400 }
    );
  }
}
