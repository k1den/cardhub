import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { validateEmailToken } from '@/lib/auth/tokens';
import { hashPassword } from '@/lib/auth/password';
import { invalidateAllUserSessions } from '@/lib/auth/session';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';
import { EmailTokenType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    const rl = await rateLimit(`reset-pw:${ip}`, { limit: 5, windowSeconds: 900 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Слишком много попыток. Пожалуйста, повторите позже.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    const validation = await validateEmailToken(token, EmailTokenType.RESET_PASSWORD);
    if (!validation) {
      return NextResponse.json(
        { error: 'Недействительная или устаревшая ссылка для сброса пароля' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: validation.userId },
        data: { passwordHash },
      }),
      prisma.emailToken.delete({
        where: { id: validation.tokenId },
      }),
      prisma.auditLog.create({
        data: {
          actorId: validation.userId,
          targetType: 'User',
          targetId: validation.userId,
          action: 'PASSWORD_RESET_COMPLETED',
          ipAddress: ip,
        },
      }),
    ]);

    // Security requirement: Revoke all existing active sessions
    await invalidateAllUserSessions(validation.userId);

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно изменен. Теперь вы можете войти с новым паролем.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при сбросе пароля' },
      { status: 500 }
    );
  }
}
