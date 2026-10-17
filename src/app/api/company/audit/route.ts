import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { companyService } from '@/lib/company/service';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Не указан companyId' }, { status: 400 });
    }

    const logs = await companyService.getAuditLogs(session.user.id, companyId);

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error: any) {
    console.error('Get company audit logs error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении журнала аудита' },
      { status: 400 }
    );
  }
}
