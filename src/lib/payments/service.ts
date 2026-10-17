import { prisma } from '@/lib/prisma';
import { SubscriptionStatus, PaymentStatus, UserRole } from '@prisma/client';
import { BillingPeriod } from './types';

export interface ProcessPaymentSuccessInput {
  providerPaymentId: string;
  amount: number;
  metadata?: {
    userId?: string;
    paymentId?: string;
    planCode?: string;
    period?: BillingPeriod;
    autoRenew?: string;
  };
  receiptUrl?: string;
}

export class PaymentService {
  /**
   * Idempotently process successful payment from webhook or simulation
   */
  async handlePaymentSuccess(input: ProcessPaymentSuccessInput) {
    const { providerPaymentId, amount, metadata, receiptUrl } = input;

    // 1. Check existing payment record
    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          { providerPaymentId },
          metadata?.paymentId ? { id: metadata.paymentId } : { providerPaymentId },
        ],
      },
      include: {
        user: true,
      },
    });

    // --- IDEMPOTENCY CHECK ---
    // If payment already succeeded, skip to prevent double extensions
    if (existingPayment && existingPayment.status === PaymentStatus.SUCCEEDED) {
      return {
        alreadyProcessed: true,
        paymentId: existingPayment.id,
        subscriptionId: existingPayment.subscriptionId,
      };
    }

    const userId = metadata?.userId || existingPayment?.userId;
    if (!userId) {
      throw new Error(`Missing userId for payment ${providerPaymentId}`);
    }

    const planCode = metadata?.planCode || 'REGULAR';
    const period: BillingPeriod = metadata?.period === 'YEAR' ? 'YEAR' : 'MONTH';
    const autoRenew = metadata?.autoRenew === 'true';

    // 2. Fetch the plan
    const plan = await prisma.plan.findUnique({
      where: { code: planCode },
    });

    if (!plan) {
      throw new Error(`Plan with code ${planCode} not found`);
    }

    // 3. Find user's existing subscription if any
    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId,
      },
      orderBy: {
        currentPeriodEnd: 'desc',
      },
    });

    const now = new Date();
    let periodStart = now;
    let periodEnd = new Date(now);

    // If current subscription is active and has not expired yet, extend from its end
    if (existingSub && existingSub.currentPeriodEnd > now && existingSub.status === SubscriptionStatus.ACTIVE) {
      periodStart = existingSub.currentPeriodStart;
      periodEnd = new Date(existingSub.currentPeriodEnd);
    }

    // Add 1 month or 1 year
    if (period === 'YEAR') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // 7-day grace period end calculation (TZ section 3)
    const gracePeriodEnd = new Date(periodEnd);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

    // 4. Upsert subscription
    let subscription;
    if (existingSub) {
      subscription = await prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          gracePeriodEnd,
          autoRenew,
          providerPaymentId,
        },
      });
    } else {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          gracePeriodEnd,
          autoRenew,
          providerPaymentId,
        },
      });
    }

    // 5. Update user role if PRO
    if (planCode === 'PRO') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.role !== UserRole.ADMIN) {
        await prisma.user.update({
          where: { id: userId },
          data: { role: UserRole.PRO },
        });
      }
    }

    // 6. Record or update Payment
    const generatedReceipt =
      receiptUrl ||
      existingPayment?.receiptUrl ||
      `https://receipt.cardhub.local/check/${providerPaymentId}`;

    let payment;
    if (existingPayment) {
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          subscriptionId: subscription.id,
          providerPaymentId,
          receiptUrl: generatedReceipt,
          amount: existingPayment.amount || amount,
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          amount,
          status: PaymentStatus.SUCCEEDED,
          provider: 'yookassa',
          providerPaymentId,
          receiptUrl: generatedReceipt,
          metadata: metadata || {},
        },
      });
    }

    // 7. Record immutable Audit Log (Section 8)
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        targetType: 'Subscription',
        targetId: subscription.id,
        action: 'SUBSCRIPTION_PAYMENT_SUCCESS',
        details: {
          planCode,
          period,
          amount,
          providerPaymentId,
          autoRenew,
          currentPeriodEnd: periodEnd.toISOString(),
        },
      },
    }).catch((err) => {
      console.error('Failed to write audit log for payment:', err);
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      paymentId: payment.id,
      alreadyProcessed: false,
    };
  }

  /**
   * Handle canceled payment notification
   */
  async handlePaymentCanceled(providerPaymentId: string, metadata?: any) {
    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          { providerPaymentId },
          metadata?.paymentId ? { id: metadata.paymentId } : { providerPaymentId },
        ],
      },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: PaymentStatus.CANCELED,
        },
      });
    }

    return { success: true };
  }

  /**
   * Turn auto-renew on/off in 1-click (Section 4.6)
   */
  async toggleAutoRenew(userId: string, autoRenew: boolean) {
    const sub = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { currentPeriodEnd: 'desc' },
    });

    if (!sub) {
      throw new Error('Подписка не найдена');
    }

    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        autoRenew,
        // If turning off, change status to CANCELED while keeping currentPeriodEnd intact
        status: !autoRenew && sub.status === SubscriptionStatus.ACTIVE ? SubscriptionStatus.CANCELED : sub.status,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        targetType: 'Subscription',
        targetId: sub.id,
        action: autoRenew ? 'AUTORENEW_ENABLED' : 'AUTORENEW_DISABLED',
        details: { autoRenew },
      },
    }).catch(() => {});

    return updated;
  }

  /**
   * Get comprehensive subscription and usage status for a user
   */
  async getUserSubscription(userId: string) {
    const [sub, user] = await Promise.all([
      prisma.subscription.findFirst({
        where: { userId },
        include: {
          plan: true,
        },
        orderBy: { currentPeriodEnd: 'desc' },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
    ]);

    const isRoleProOrAdmin = user?.role === 'PRO' || user?.role === 'ADMIN';

    const now = new Date();
    const isSubActive = Boolean(
      sub &&
      (sub.status === SubscriptionStatus.ACTIVE || sub.status === SubscriptionStatus.CANCELED) &&
      sub.currentPeriodEnd > now
    );
    const isPastDue = Boolean(sub && sub.currentPeriodEnd <= now && sub.gracePeriodEnd && sub.gracePeriodEnd > now);
    const isPro = Boolean((isSubActive && sub?.plan?.code === 'PRO') || isRoleProOrAdmin);
    const isActive = isSubActive || isRoleProOrAdmin;

    const cardsCount = await prisma.card.count({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
    });

    // Payment history
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const maxCards = isPro ? 10 : 1;

    const defaultProPlan = {
      code: 'PRO',
      name: user?.role === 'ADMIN' ? 'Администратор' : 'Pro (Выдан администратором)',
      description: 'Компания, визитки сотрудников, единый корпоративный брендинг, красивый slug и аудит.',
      priceMonth: 1490,
      priceYear: 14900,
      maxCards: 10,
    };

    const effectivePlan = (isRoleProOrAdmin && (!sub || sub?.plan?.code !== 'PRO'))
      ? defaultProPlan
      : (sub?.plan || {
          code: 'FREE',
          name: 'Базовый',
          description: '1 цифровая визитка, ссылка, QR-код, запись на NFC-метку и скачивание vCard.',
          priceMonth: 0,
          priceYear: 0,
          maxCards: 1,
        });

    const effectiveEnd = sub?.currentPeriodEnd || (isRoleProOrAdmin ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) : null);
    const daysRemaining = effectiveEnd ? Math.max(0, Math.ceil((effectiveEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

    return {
      subscription: sub,
      plan: effectivePlan,
      isActive: isActive || isPastDue,
      isPro,
      isPastDue,
      autoRenew: sub?.autoRenew || false,
      currentPeriodEnd: effectiveEnd,
      daysRemaining,
      cardsUsed: cardsCount,
      maxCards,
      payments,
    };
  }

  /**
   * Check if user is allowed to create another card according to plan limit
   */
  async checkCardCreationAllowed(userId: string) {
    const currentCardsCount = await prisma.card.count({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
    });

    const status = await this.getUserSubscription(userId);

    const allowed = currentCardsCount < status.maxCards;

    return {
      allowed,
      currentCards: currentCardsCount,
      maxCards: status.maxCards,
      planCode: status.plan.code,
      isPro: status.isPro,
    };
  }
}

export const paymentService = new PaymentService();
