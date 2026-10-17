import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Для отключения 2FA введите текущий пароль' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const isMatch = await verifyPassword(user.passwordHash, password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { totpEnabled: false },
      }),
      prisma.totpSecret.deleteMany({
        where: { userId: user.id },
      }),
      prisma.auditLog.create({
        data: {
          actorId: user.id,
          targetType: 'User',
          targetId: user.id,
          action: 'USER_2FA_DISABLED',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Двухфакторная аутентификация отключена.',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Ошибка при отключении 2FA' },
      { status: 500 }
    );
  }
}
