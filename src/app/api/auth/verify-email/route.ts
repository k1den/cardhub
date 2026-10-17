import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateEmailToken } from '@/lib/auth/tokens';
import { EmailTokenType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Токен подтверждения не передан' }, { status: 400 });
    }

    const validation = await validateEmailToken(token, EmailTokenType.VERIFY_EMAIL);

    if (!validation) {
      return NextResponse.json(
        {
          error:
            'Токен подтверждения уже был использован или устарел. Если вы уже подтвердили email, просто войдите в аккаунт.',
        },
        { status: 400 }
      );
    }

    // Check if user is already verified
    const user = await prisma.user.findUnique({
      where: { id: validation.userId },
      select: { id: true, emailVerified: true },
    });

    if (user?.emailVerified) {
      // Safe cleanup of the token if still present
      await prisma.emailToken.deleteMany({ where: { id: validation.tokenId } });
      return NextResponse.json({
        success: true,
        message: 'Email уже успешно подтвержден! Вы можете войти в свой аккаунт.',
      });
    }

    // Transaction with deleteMany to prevent concurrency race exceptions
    await prisma.$transaction([
      prisma.user.update({
        where: { id: validation.userId },
        data: { emailVerified: true },
      }),
      prisma.emailToken.deleteMany({
        where: { id: validation.tokenId },
      }),
      prisma.auditLog.create({
        data: {
          actorId: validation.userId,
          targetType: 'User',
          targetId: validation.userId,
          action: 'EMAIL_VERIFIED',
          details: { verifiedAt: new Date().toISOString() },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Email успешно подтвержден. Теперь вы можете войти в свой аккаунт.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при подтверждении email' },
      { status: 500 }
    );
  }
}
