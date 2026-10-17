import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { verifyTotpCode, decryptSecret } from '@/lib/security/totp';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Введите 6-значный код из приложения' }, { status: 400 });
    }

    const totpRecord = await prisma.totpSecret.findUnique({
      where: { userId: session.user.id },
    });

    if (!totpRecord) {
      return NextResponse.json(
        { error: 'Секретный ключ 2FA не найден. Начните настройку заново.' },
        { status: 400 }
      );
    }

    const plainSecret = decryptSecret(totpRecord.secretEncrypted);
    const isValid = verifyTotpCode(plainSecret, code.trim());

    if (!isValid) {
      return NextResponse.json(
        { error: 'Неверный код подтверждения. Проверьте время на телефоне и повторите ввод.' },
        { status: 400 }
      );
    }

    // Enable 2FA on user account
    await prisma.user.update({
      where: { id: session.user.id },
      data: { totpEnabled: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        targetType: 'User',
        targetId: session.user.id,
        action: 'USER_2FA_ENABLED',
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Двухфакторная аутентификация успешно включена!',
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Ошибка при проверке кода 2FA' },
      { status: 500 }
    );
  }
}
