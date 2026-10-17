import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { createPasswordResetToken } from '@/lib/auth/tokens';
import { sendPasswordResetEmail } from '@/lib/email/sender';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate limiting: 3 reset attempts per 30 minutes per IP
    const rl = await rateLimit(`forgot-pw:${ip}`, { limit: 3, windowSeconds: 1800 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Слишком много запросов на сброс пароля. Пожалуйста, подождите.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 400 });
    }

    const { email } = result.data;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && !user.deletedAt) {
      const resetToken = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, resetToken);

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          targetType: 'User',
          targetId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          ipAddress: ip,
        },
      });
    }

    // Always return uniform message to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'Если указанный email зарегистрирован, ссылка для сброса пароля отправлена.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
