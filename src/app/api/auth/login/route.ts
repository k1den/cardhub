import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations/auth';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';
import { decryptSecret, verifyTotpCode } from '@/lib/security/totp';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Rate limiting: 5 login attempts per 15 minutes per IP
    const rl = await rateLimit(`login:${ip}`, { limit: 5, windowSeconds: 900 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Слишком много попыток входа. Пожалуйста, подождите перед повторной попыткой.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Неверные данные входа' },
        { status: 400 }
      );
    }

    const { email, password, totpCode } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        totpSecret: true,
      },
    });

    // Uniform 401 response for non-existent users or bad passwords (anti-enumeration)
    if (!user || user.deletedAt) {
      return NextResponse.json(
        { error: 'Неверный адрес электронной почты или пароль' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный адрес электронной почты или пароль' },
        { status: 401 }
      );
    }

    // Check email verification per TZ section 4.1
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Пожалуйста, подтвердите ваш email перед входом в систему.' },
        { status: 403 }
      );
    }

    // Handle 2FA if enabled
    if (user.totpEnabled) {
      if (!totpCode) {
        return NextResponse.json(
          { require2FA: true, message: 'Введите код двухфакторной аутентификации' },
          { status: 200 }
        );
      }

      if (!user.totpSecret) {
        return NextResponse.json({ error: 'Ошибка конфигурации 2FA' }, { status: 500 });
      }

      const plainSecret = decryptSecret(user.totpSecret.secretEncrypted);
      const isValidTotp = verifyTotpCode(plainSecret, totpCode.trim());

      if (!isValidTotp) {
        return NextResponse.json(
          { error: 'Неверный код двухфакторной аутентификации' },
          { status: 401 }
        );
      }
    }

    // Create session and set HttpOnly Cookie
    const sessionId = await createSession(user.id, ip, userAgent);
    await setSessionCookie(sessionId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        targetType: 'User',
        targetId: user.id,
        action: 'USER_LOGGED_IN',
        ipAddress: ip,
        details: { userAgent },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при авторизации' },
      { status: 500 }
    );
  }
}
