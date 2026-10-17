import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { paymentProvider } from '@/lib/payments/yookassa';
import { paymentService } from '@/lib/payments/service';
import { SubscriptionStatus, PaymentStatus, UserRole } from '@prisma/client';

describe('Stage 4: Subscriptions, YooKassa Payments & 54-FZ Fiscalization', () => {
  let testUserId = '';
  let testEmail = '';

  beforeAll(async () => {
    testEmail = `paytest_${Date.now()}@example.com`;
    const passwordHash = await hashPassword('SecurePass123!');

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        emailVerified: true,
        role: UserRole.USER,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { userId: testUserId } });
    await prisma.subscription.deleteMany({ where: { userId: testUserId } });
    await prisma.card.deleteMany({ where: { ownerId: testUserId } });
    await prisma.auditLog.deleteMany({ where: { actorId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  it('generates compliant 54-FZ fiscal receipt payload', () => {
    const receipt = paymentProvider.buildFiscalReceipt(
      testEmail,
      'Подписка CardHub: Тариф Обычный (1 месяц)',
      290
    );

    expect(receipt.customer.email).toBe(testEmail);
    expect(receipt.items).toHaveLength(1);
    expect(receipt.items[0].description).toContain('Подписка');
    expect(receipt.items[0].amount.value).toBe('290.00');
    expect(receipt.items[0].amount.currency).toBe('RUB');
    expect(receipt.items[0].vat_code).toBe(1); // 1 = Без НДС
    expect(receipt.items[0].payment_mode).toBe('full_payment');
    expect(receipt.items[0].payment_subject).toBe('service');
  });

  it('creates payment with sandbox simulation', async () => {
    const result = await paymentProvider.createPayment({
      userId: testUserId,
      userEmail: testEmail,
      planCode: 'REGULAR',
      period: 'MONTH',
      amount: 290,
      autoRenew: true,
      returnUrl: 'http://localhost:3000/dashboard/subscription?status=success',
    });

    expect(result.paymentId).toBeDefined();
    expect(result.providerPaymentId).toBeDefined();
    expect(result.confirmationUrl).toContain('payment_id=');
    expect(result.status).toBe('PENDING');
  });

  it('idempotently activates subscription on payment success and prevents double extensions', async () => {
    const providerPaymentId = `test_prov_${Date.now()}`;

    // 1. Initial success processing
    const firstResult = await paymentService.handlePaymentSuccess({
      providerPaymentId,
      amount: 290,
      metadata: {
        userId: testUserId,
        planCode: 'REGULAR',
        period: 'MONTH',
        autoRenew: 'true',
      },
      receiptUrl: `https://receipt.cardhub.local/check/${providerPaymentId}`,
    });

    expect(firstResult.success).toBe(true);
    expect(firstResult.alreadyProcessed).toBe(false);

    // Verify subscription created
    const sub = await prisma.subscription.findFirst({
      where: { userId: testUserId },
      include: { plan: true },
    });

    expect(sub).not.toBeNull();
    expect(sub?.status).toBe(SubscriptionStatus.ACTIVE);
    expect(sub?.plan.code).toBe('REGULAR');
    expect(sub?.autoRenew).toBe(true);

    const initialEnd = sub!.currentPeriodEnd.getTime();

    // 2. Duplicate webhook with identical providerPaymentId (Idempotency test)
    const duplicateResult = await paymentService.handlePaymentSuccess({
      providerPaymentId,
      amount: 290,
      metadata: {
        userId: testUserId,
        planCode: 'REGULAR',
        period: 'MONTH',
        autoRenew: 'true',
      },
      receiptUrl: `https://receipt.cardhub.local/check/${providerPaymentId}`,
    });

    expect(duplicateResult.alreadyProcessed).toBe(true);

    // Verify currentPeriodEnd was NOT extended a second time
    const subAfterDuplicate = await prisma.subscription.findFirst({
      where: { userId: testUserId },
    });

    expect(subAfterDuplicate?.currentPeriodEnd.getTime()).toBe(initialEnd);
  });

  it('allows 1-click auto-renew disabling and re-enabling', async () => {
    // Disable auto-renew
    const disabledSub = await paymentService.toggleAutoRenew(testUserId, false);
    expect(disabledSub.autoRenew).toBe(false);
    expect(disabledSub.status).toBe(SubscriptionStatus.CANCELED);

    // Period should still be active in getUserSubscription
    const statusWhileCanceled = await paymentService.getUserSubscription(testUserId);
    expect(statusWhileCanceled.isActive).toBe(true);
    expect(statusWhileCanceled.autoRenew).toBe(false);

    // Re-enable auto-renew
    const reEnabledSub = await paymentService.toggleAutoRenew(testUserId, true);
    expect(reEnabledSub.autoRenew).toBe(true);
  });

  it('enforces tariff card limits (REGULAR allows 1 card, PRO allows up to 10 cards)', async () => {
    // User has REGULAR plan right now
    const initialCheck = await paymentService.checkCardCreationAllowed(testUserId);
    expect(initialCheck.allowed).toBe(true);
    expect(initialCheck.maxCards).toBe(1);

    // Create 1 card
    const card1 = await prisma.card.create({
      data: {
        ownerId: testUserId,
        slug: `card1-${Date.now()}`,
        fullName: 'Первая визитка',
        published: true,
      },
    });

    // Attempting to create 2nd card on REGULAR should be rejected
    const checkAfterOneCard = await paymentService.checkCardCreationAllowed(testUserId);
    expect(checkAfterOneCard.allowed).toBe(false);
    expect(checkAfterOneCard.currentCards).toBe(1);
    expect(checkAfterOneCard.maxCards).toBe(1);

    // Now upgrade user to PRO plan via payment
    const proPaymentId = `pro_prov_${Date.now()}`;
    await paymentService.handlePaymentSuccess({
      providerPaymentId: proPaymentId,
      amount: 1490,
      metadata: {
        userId: testUserId,
        planCode: 'PRO',
        period: 'MONTH',
        autoRenew: 'true',
      },
      receiptUrl: `https://receipt.cardhub.local/check/${proPaymentId}`,
    });

    // Check limits again: PRO should allow creating more cards
    const checkPro = await paymentService.checkCardCreationAllowed(testUserId);
    expect(checkPro.allowed).toBe(true);
    expect(checkPro.maxCards).toBe(10);
    expect(checkPro.isPro).toBe(true);

    // Clean up created test card
    await prisma.card.delete({ where: { id: card1.id } });
  });
});
