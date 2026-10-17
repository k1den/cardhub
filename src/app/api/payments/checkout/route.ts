import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { paymentProvider } from '@/lib/payments/yookassa';
import { paymentService } from '@/lib/payments/service';
import { BillingPeriod } from '@/lib/payments/types';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const { planCode, period, autoRenew, acceptOffer, simulateImmediate } = body;

    if (!acceptOffer) {
      return NextResponse.json(
        { error: 'Для оформления подписки необходимо принять условия публичной оферты' },
        { status: 400 }
      );
    }

    if (planCode !== 'REGULAR' && planCode !== 'PRO') {
      return NextResponse.json({ error: 'Неверный тарифный план' }, { status: 400 });
    }

    const billingPeriod: BillingPeriod = period === 'YEAR' ? 'YEAR' : 'MONTH';

    const plan = await prisma.plan.findUnique({
      where: { code: planCode },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Тариф временно недоступен' }, { status: 404 });
    }

    const amount = billingPeriod === 'YEAR' ? plan.priceYear : plan.priceMonth;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${appUrl}/dashboard/subscription?status=success`;

    // 1. Create initial PENDING payment in DB
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount,
        currency: 'RUB',
        status: 'PENDING',
        provider: 'yookassa',
        metadata: {
          userId: session.user.id,
          planCode,
          period: billingPeriod,
          autoRenew: autoRenew ? 'true' : 'false',
        },
      },
    });

    // 2. Call provider to get confirmationUrl
    const paymentResult = await paymentProvider.createPayment({
      userId: session.user.id,
      userEmail: session.user.email,
      planCode,
      period: billingPeriod,
      amount,
      autoRenew: Boolean(autoRenew),
      returnUrl,
    });

    // Update payment with providerPaymentId
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: paymentResult.providerPaymentId,
        receiptUrl: paymentResult.receiptUrl,
      },
    });

    // In simulation mode if requested (e.g. 1-click test checkout in dev):
    if (simulateImmediate) {
      await paymentService.handlePaymentSuccess({
        providerPaymentId: paymentResult.providerPaymentId,
        amount,
        metadata: {
          userId: session.user.id,
          paymentId: payment.id,
          planCode,
          period: billingPeriod,
          autoRenew: autoRenew ? 'true' : 'false',
        },
        receiptUrl: paymentResult.receiptUrl,
      });

      return NextResponse.json({
        success: true,
        simulated: true,
        confirmationUrl: returnUrl,
      });
    }

    return NextResponse.json({
      success: true,
      confirmationUrl: paymentResult.confirmationUrl,
      paymentId: payment.id,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при инициализации платежа' },
      { status: 500 }
    );
  }
}
