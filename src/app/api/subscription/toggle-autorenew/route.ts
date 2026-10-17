import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { paymentService } from '@/lib/payments/service';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const { autoRenew } = body;

    if (typeof autoRenew !== 'boolean') {
      return NextResponse.json({ error: 'Неверный формат параметра autoRenew' }, { status: 400 });
    }

    const updated = await paymentService.toggleAutoRenew(session.user.id, autoRenew);

    return NextResponse.json({
      success: true,
      autoRenew: updated.autoRenew,
      status: updated.status,
    });
  } catch (error: any) {
    console.error('Toggle autorenew error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при изменении автопродления' },
      { status: 500 }
    );
  }
}
