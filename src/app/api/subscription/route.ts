import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { paymentService } from '@/lib/payments/service';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const data = await paymentService.getUserSubscription(session.user.id);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении данных подписки' },
      { status: 500 }
    );
  }
}
