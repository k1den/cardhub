import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';
import { createEmailVerificationToken } from '@/lib/auth/tokens';
import { sendVerificationEmail } from '@/lib/email/sender';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';
import { ConsentType, SubscriptionStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Rate limiting: 5 registration attempts per 15 minutes per IP
    const rl = await rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 900 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Слишком много попыток. Пожалуйста, повторите позже.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, consentPdProcessing, consentOffer, consentMarketing } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Пользователь с таким email уже зарегистрирован. Пожалуйста, войдите в аккаунт или восстановите пароль.',
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user and mandatory 152-ФЗ consents in a single transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          emailVerified: false,
        },
      });

      // 1. Consent to Personal Data Processing (152-ФЗ)
      if (consentPdProcessing) {
        await tx.consent.create({
          data: {
            userId: user.id,
            consentType: ConsentType.PD_PROCESSING,
            documentVersion: '1.0',
            ipAddress: ip,
            userAgent,
          },
        });
      }

      // 2. Acceptance of Public Offer
      if (consentOffer) {
        await tx.consent.create({
          data: {
            userId: user.id,
            consentType: ConsentType.OFFER,
            documentVersion: '1.0',
            ipAddress: ip,
            userAgent,
          },
        });
      }

      // 3. Marketing communications consent (optional, 38-ФЗ)
      if (consentMarketing) {
        await tx.consent.create({
          data: {
            userId: user.id,
            consentType: ConsentType.MARKETING,
            documentVersion: '1.0',
            ipAddress: ip,
            userAgent,
          },
        });
      }

      // 4. Initial 7-day Free Trial on REGULAR plan (Option C)
      let regularPlan = await tx.plan.findUnique({
        where: { code: 'REGULAR' },
      });
      if (!regularPlan) {
        regularPlan = await tx.plan.create({
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
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const graceEnd = new Date(trialEnd.getTime() + 14 * 24 * 60 * 60 * 1000);

      await tx.subscription.create({
        data: {
          userId: user.id,
          planId: regularPlan.id,
          status: SubscriptionStatus.TRIAL,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          gracePeriodEnd: graceEnd,
          autoRenew: false,
          providerPaymentId: 'trial_7_days',
        },
      });

      // Audit log registration
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          targetType: 'User',
          targetId: user.id,
          action: 'USER_REGISTERED',
          ipAddress: ip,
          details: { email },
        },
      });

      return user;
    });

    // Generate token and send verification email
    const verificationToken = await createEmailVerificationToken(newUser.id);
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      {
        success: true,
        message: 'Регистрация прошла успешно! Проверьте вашу электронную почту для подтверждения.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
}
