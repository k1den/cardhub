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
   * Automatically ensure a user has an initial 7-day trial subscription if no subscription exists
   */
  async ensureTrialSubscription(userId: string) {
    const existing = await prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true },
    });
    if (existing) return existing;

    // Fetch or create REGULAR plan
    let regularPlan = await prisma.plan.findUnique({
      where: { code: 'REGULAR' },
    });
    if (!regularPlan) {
      regularPlan = await prisma.plan.create({
        data: {
          code: 'REGULAR',
          name: 'Обычный',
          description: '1 цифровая визитка, ссылка, QR-код, запись на NFC-метку и скачивание vCard.',
          priceMonth: 290,
          priceYear: 2900,
          maxCards: 1,
          maxMembers: 0,
        },
      });
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days trial
    const graceEnd = new Date(trialEnd.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 days grace (TZ section 3)

    const trialSub = await prisma.subscription.create({
      data: {
        userId,
        planId: regularPlan.id,
        status: SubscriptionStatus.TRIAL,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        gracePeriodEnd: graceEnd,
        autoRenew: false,
        providerPaymentId: 'trial_7_days',
      },
      include: {
        plan: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        targetType: 'Subscription',
        targetId: trialSub.id,
        action: 'SUBSCRIPTION_TRIAL_STARTED',
        details: {
          trialDays: 7,
          currentPeriodEnd: trialEnd.toISOString(),
          gracePeriodEnd: graceEnd.toISOString(),
        },
      },
    }).catch(() => {});

    return trialSub;
  }

  /**
   * Get comprehensive subscription and usage status for a user
   */
  async getUserSubscription(userId: string) {
    let [sub, user] = await Promise.all([
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

    // If regular user has no subscription record at all, grant initial 7-day trial
    if (!sub && user && !isRoleProOrAdmin) {
      sub = await this.ensureTrialSubscription(userId);
    }

    const now = new Date();
    const isTrial = Boolean(
      sub &&
      sub.status === SubscriptionStatus.TRIAL &&
      sub.currentPeriodEnd > now
    );

    const isSubActive = Boolean(
      sub &&
      (sub.status === SubscriptionStatus.ACTIVE ||
        sub.status === SubscriptionStatus.CANCELED ||
        sub.status === SubscriptionStatus.TRIAL) &&
      sub.currentPeriodEnd > now
    );

    const isPastDue = Boolean(
      sub &&
      sub.currentPeriodEnd <= now &&
      sub.gracePeriodEnd &&
      sub.gracePeriodEnd > now
    );

    const isExpired = Boolean(
      (sub && sub.status === SubscriptionStatus.EXPIRED) ||
      (sub && sub.currentPeriodEnd <= now && (!sub.gracePeriodEnd || sub.gracePeriodEnd <= now)) ||
      (!sub && !isRoleProOrAdmin)
    );

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

    let maxCards = 0;
    if (isPro) {
      maxCards = 10;
    } else if (isActive || isPastDue) {
      maxCards = 1;
    } else {
      maxCards = 0;
    }

    const defaultProPlan = {
      code: 'PRO',
      name: user?.role === 'ADMIN' ? 'Администратор' : 'Pro (Выдан администратором)',
      description: 'Компания, визитки сотрудников, единый корпоративный брендинг, красивый slug и аудит.',
      priceMonth: 1490,
      priceYear: 14900,
      maxCards: 10,
    };

    const trialPlan = {
      code: 'TRIAL',
      name: 'Пробный период (7 дней)',
      description: 'Бесплатный ознакомительный доступ: 1 цифровая визитка, ссылка, QR-код и запись на NFC.',
      priceMonth: 0,
      priceYear: 0,
      maxCards: 1,
    };

    const expiredPlan = {
      code: 'EXPIRED',
      name: 'Подписка истекла',
      description: 'Срок пробного периода или подписки завершился. Для использования визиток оформите подписку.',
      priceMonth: 0,
      priceYear: 0,
      maxCards: 0,
    };

    let effectivePlan = sub?.plan || {
      code: 'REGULAR',
      name: 'Обычный',
      description: '1 цифровая визитка, ссылка, QR-код, запись на NFC-метку и скачивание vCard.',
      priceMonth: 290,
      priceYear: 2900,
      maxCards: 1,
    };

    if (isRoleProOrAdmin && (!sub || sub?.plan?.code !== 'PRO')) {
      effectivePlan = defaultProPlan;
    } else if (isTrial) {
      effectivePlan = trialPlan;
    } else if (!isActive && !isPastDue) {
      effectivePlan = expiredPlan;
    }

    const effectiveEnd = sub?.currentPeriodEnd || (isRoleProOrAdmin ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) : null);
    const daysRemaining = effectiveEnd ? Math.max(0, Math.ceil((effectiveEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

    return {
      subscription: sub,
      plan: effectivePlan,
      isActive: isActive || isPastDue,
      isTrial,
      isPro,
      isPastDue,
      isExpired,
      autoRenew: sub?.autoRenew || false,
      currentPeriodEnd: effectiveEnd,
      daysRemaining,
      cardsUsed: cardsCount,
      maxCards,
      payments,
    };
  }

  /**
   * Check if user is allowed to create another card according to plan limit and trial status
   */
  async checkCardCreationAllowed(userId: string) {
    const currentCardsCount = await prisma.card.count({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
    });

    const status = await this.getUserSubscription(userId);

    const allowed = (status.isActive || status.isPro) && currentCardsCount < status.maxCards;

    let reason: string | undefined;
    if (!status.isActive && !status.isPro) {
      reason = 'Срок действия вашего 7-дневного пробного периода или подписки истек. Оформите подписку для создания и публикации визиток.';
    } else if (currentCardsCount >= status.maxCards) {
      reason = status.isPro
        ? 'Вы достигли максимального лимита в 10 визиток на тарифе Pro.'
        : status.isTrial
        ? 'В рамках 7-дневного пробного периода доступна 1 визитка. Перейдите на тариф Pro для создания дополнительных визиток.'
        : 'На тарифе Обычный доступна 1 визитка. Перейдите на тариф Pro для создания дополнительных визиток.';
    }

    return {
      allowed,
      currentCards: currentCardsCount,
      maxCards: status.maxCards,
      planCode: status.plan.code,
      isPro: status.isPro,
      isTrial: status.isTrial,
      isPastDue: status.isPastDue,
      reason,
    };
  }
}

export const paymentService = new PaymentService();
