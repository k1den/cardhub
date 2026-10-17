import { NextResponse } from 'next/server';
import { getSession, removeSessionCookie } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Для подтверждения удаления введите текущий пароль' },
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

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Soft delete user (152-FZ 30 days retention per TZ)
      await tx.user.update({
        where: { id: user.id },
        data: {
          deletedAt: now,
          emailVerified: false,
        },
      });

      // 2. Soft delete and unpublish all user cards
      await tx.card.updateMany({
        where: { ownerId: user.id },
        data: {
          deletedAt: now,
          published: false,
        },
      });

      // 3. Remove company memberships
      await tx.membership.deleteMany({
        where: { userId: user.id },
      });

      // 4. Invalidate all active sessions
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // 5. Audit Log entry
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          targetType: 'User',
          targetId: user.id,
          action: 'USER_ACCOUNT_DELETED',
          details: { email: user.email },
        },
      });
    });

    // Destroy current session cookie
    await removeSessionCookie();

    return NextResponse.json({
      success: true,
      message: 'Учетная запись и персональные данные успешно удалены.',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении учетной записи' },
      { status: 500 }
    );
  }
}
