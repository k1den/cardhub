import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';
import { createEmailVerificationToken } from '@/lib/auth/tokens';
import { sendVerificationEmail } from '@/lib/email/sender';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';
import { ConsentType } from '@prisma/client';

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
      // In compliance with section 8, do not disclose whether user exists
      return NextResponse.json(
        {
          success: true,
          message: 'Если указанный адрес свободен, мы отправили ссылку для подтверждения на ваш email.',
        },
        { status: 200 }
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/auth/verify?token=${verificationToken}`;

    return NextResponse.json(
      {
        success: true,
        message: 'Регистрация прошла успешно! Проверьте вашу электронную почту для подтверждения.',
        devVerifyUrl: process.env.NODE_ENV === 'development' ? verifyUrl : undefined,
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
