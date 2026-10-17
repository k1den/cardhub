import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/guard';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, session } = await requireAdmin();
  if (!authorized || !session) return response;

  const { id: reportId } = await params;

  try {
    const body = await request.json();
    const { action, moderatorNote } = body;

    if (!['APPROVE_HIDE_CARD', 'REJECT', 'BAN_AUTHOR'].includes(action)) {
      return NextResponse.json(
        { error: 'Недопустимое действие модерации' },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        card: {
          select: {
            id: true,
            ownerId: true,
            slug: true,
            fullName: true,
            published: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Жалоба не найдена' }, { status: 404 });
    }

    if (action === 'REJECT') {
      await prisma.$transaction([
        prisma.report.update({
          where: { id: reportId },
          data: {
            status: 'REJECTED',
            resolvedAt: new Date(),
          },
        }),
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            targetType: 'REPORT',
            targetId: reportId,
            action: 'REPORT_REJECTED',
            details: {
              cardId: report.cardId,
              cardSlug: report.card.slug,
              reason: report.reason,
              moderatorNote: moderatorNote || null,
            },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Жалоба отклонена. Визитка оставлена опубликованной.',
      });
    }

    if (action === 'APPROVE_HIDE_CARD') {
      await prisma.$transaction([
        prisma.report.update({
          where: { id: reportId },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
          },
        }),
        prisma.card.update({
          where: { id: report.cardId },
          data: { published: false },
        }),
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            targetType: 'CARD',
            targetId: report.cardId,
            action: 'REPORT_RESOLVED_CARD_HIDDEN',
            details: {
              reportId,
              cardSlug: report.card.slug,
              reason: report.reason,
              moderatorNote: moderatorNote || null,
            },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Жалоба удовлетворена. Визитка снята с публикации (149-ФЗ).',
      });
    }

    if (action === 'BAN_AUTHOR') {
      const authorId = report.card.ownerId;

      await prisma.$transaction([
        prisma.report.update({
          where: { id: reportId },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
          },
        }),
        // Hide all cards by this author
        prisma.card.updateMany({
          where: { ownerId: authorId },
          data: { published: false },
        }),
        // Mark author as deleted / banned
        prisma.user.update({
          where: { id: authorId },
          data: { deletedAt: new Date() },
        }),
        // Terminate all author sessions
        prisma.session.deleteMany({
          where: { userId: authorId },
        }),
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            targetType: 'USER',
            targetId: authorId,
            action: 'USER_BANNED_FOR_VIOLATION',
            details: {
              reportId,
              cardId: report.cardId,
              cardSlug: report.card.slug,
              moderatorNote: moderatorNote || null,
            },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Автор заблокирован, все его визитки скрыты, сессии аннулированы.',
      });
    }

    return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 });
  } catch (err: any) {
    console.error('Error resolving report:', err);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при модерации' },
      { status: 500 }
    );
  }
}
