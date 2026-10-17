import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/guard';

export async function GET(request: NextRequest) {
  const { authorized, response } = await requireAdmin();
  if (!authorized) return response;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim();
  const role = searchParams.get('role');

  let whereClause: any = {};

  if (search) {
    whereClause.email = {
      contains: search,
      mode: 'insensitive',
    };
  }

  if (role && ['USER', 'PRO', 'ADMIN'].includes(role)) {
    whereClause.role = role;
  }

  try {
    const users = await prisma.user.findMany({
      where: whereClause,
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        totpEnabled: true,
        createdAt: true,
        deletedAt: true,
        _count: {
          select: {
            cards: true,
            memberships: true,
          },
        },
        subscriptions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { authorized, response, session } = await requireAdmin();
  if (!authorized || !session) return response;

  try {
    const body = await request.json();
    const { userId, action, role: newRole } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Не указан идентификатор пользователя' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Protection against modifying yourself to non-admin or blocking yourself
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'Вы не можете изменить свою собственную роль администратора или заблокировать себя' },
        { status: 400 }
      );
    }

    if (action === 'CHANGE_ROLE') {
      if (!['USER', 'PRO', 'ADMIN'].includes(newRole)) {
        return NextResponse.json(
          { error: 'Недопустимая роль' },
          { status: 400 }
        );
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      // Synchronize with Subscription table
      if (newRole === 'PRO') {
        const proPlan = await prisma.plan.findUnique({ where: { code: 'PRO' } });
        if (proPlan) {
          const oneYearAhead = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
          const existingSub = await prisma.subscription.findFirst({
            where: { userId },
            orderBy: { currentPeriodEnd: 'desc' },
          });

          if (existingSub) {
            await prisma.subscription.update({
              where: { id: existingSub.id },
              data: {
                planId: proPlan.id,
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: oneYearAhead,
                autoRenew: false,
              },
            });
          } else {
            await prisma.subscription.create({
              data: {
                userId,
                planId: proPlan.id,
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: oneYearAhead,
                autoRenew: false,
                providerPaymentId: `admin_grant_${Date.now()}`,
              },
            });
          }
        }
      } else if (newRole === 'USER') {
        await prisma.subscription.updateMany({
          where: { userId, status: 'ACTIVE' },
          data: {
            status: 'CANCELED',
            currentPeriodEnd: new Date(),
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          targetType: 'USER',
          targetId: userId,
          action: 'USER_ROLE_CHANGED',
          details: {
            previousRole: targetUser.role,
            newRole,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Роль пользователя успешно изменена на ${newRole} (подписка синхронизирована)`,
        user: { id: updated.id, role: updated.role },
      });
    }

    if (action === 'TOGGLE_BLOCK') {
      const isCurrentlyBlocked = targetUser.deletedAt !== null;
      const newDeletedAt = isCurrentlyBlocked ? null : new Date();

      if (!isCurrentlyBlocked) {
        // Blocking: purge sessions and unpublish cards
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { deletedAt: newDeletedAt },
          }),
          prisma.session.deleteMany({
            where: { userId },
          }),
          prisma.card.updateMany({
            where: { ownerId: userId },
            data: { published: false },
          }),
          prisma.auditLog.create({
            data: {
              actorId: session.user.id,
              targetType: 'USER',
              targetId: userId,
              action: 'USER_BLOCKED',
              details: { email: targetUser.email },
            },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: 'Пользователь заблокирован. Сессии аннулированы, визитки скрыты.',
          blocked: true,
        });
      } else {
        // Unblocking
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { deletedAt: null },
          }),
          prisma.auditLog.create({
            data: {
              actorId: session.user.id,
              targetType: 'USER',
              targetId: userId,
              action: 'USER_UNBLOCKED',
              details: { email: targetUser.email },
            },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: 'Пользователь разблокирован.',
          blocked: false,
        });
      }
    }

    return NextResponse.json(
      { error: 'Неизвестное действие' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Error modifying user in admin:', err);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
