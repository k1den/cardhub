import { NextResponse } from 'next/server';
import { paymentProvider } from '@/lib/payments/yookassa';
import { paymentService } from '@/lib/payments/service';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    const isValid = await paymentProvider.verifyWebhook(req, rawBody);
    if (!isValid) {
      console.warn('YooKassa webhook verification failed');
      return NextResponse.json({ error: 'Неверная подпись вебхука' }, { status: 400 });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Неверный JSON' }, { status: 400 });
    }

    const event = payload.event;
    const paymentObj = payload.object;

    if (!paymentObj || !paymentObj.id) {
      return NextResponse.json({ error: 'Отсутствуют данные платежа' }, { status: 400 });
    }

    const providerPaymentId = paymentObj.id;
    const amount = parseFloat(paymentObj.amount?.value || '0');
    const metadata = paymentObj.metadata || {};

    if (event === 'payment.succeeded') {
      const receiptUrl = `https://yookassa.ru/my/receipts/${providerPaymentId}`;

      await paymentService.handlePaymentSuccess({
        providerPaymentId,
        amount,
        metadata,
        receiptUrl,
      });
    } else if (event === 'payment.canceled') {
      await paymentService.handlePaymentCanceled(providerPaymentId, metadata);
    }

    return NextResponse.json({ received: true, status: 'ok' });
  } catch (error: any) {
    console.error('YooKassa webhook processing error:', error);
    // Return 200 or 500 depending on transient errors. In YooKassa, returning 500 triggers retry.
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
