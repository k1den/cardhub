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

    const csvContent = await companyService.generateBatchNfcCsv(session.user.id, companyId);

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="company-nfc-cards.csv"',
      },
    });
  } catch (error: any) {
    console.error('Export company NFC CSV error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при экспорте ссылок' },
      { status: 400 }
    );
  }
}
