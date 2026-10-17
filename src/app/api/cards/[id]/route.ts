import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { cardFormSchema } from '@/lib/validations/card';
import { isValidCustomSlug } from '@/lib/cards/slug';
import { paymentService } from '@/lib/payments/service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Helper to verify card ownership / permissions (Anti-IDOR).
 */
async function getAuthorizedCard(cardId: string, userId: string, userRole: string) {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      deletedAt: null,
    },
    include: {
      fields: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!card) {
    return null;
  }

  // Superadmin has access
  if (userRole === 'ADMIN') {
    return card;
  }

  // Owner has access
  if (card.ownerId === userId) {
    return card;
  }

  // Company Pro admin check (if card belongs to user's company and user is OWNER)
  if (card.companyId) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: card.companyId,
        },
      },
    });

    if (membership && membership.role === 'OWNER') {
      return card;
    }
  }

  return null;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { id } = await params;
    const card = await getAuthorizedCard(id, session.user.id, session.user.role);

    if (!card) {
      return NextResponse.json({ error: 'Визитка не найдена или нет доступа' }, { status: 404 });
    }

    return NextResponse.json({ success: true, card });
  } catch (error) {
    console.error('Get card error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { id } = await params;
    const card = await getAuthorizedCard(id, session.user.id, session.user.role);

    if (!card) {
      return NextResponse.json({ error: 'Визитка не найдена или нет прав на редактирование' }, { status: 403 });
    }

    const body = await req.json();
    const result = cardFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check custom slug if changed
    let slug = card.slug;
    if (data.slug && data.slug !== card.slug) {
      const subStatus = await paymentService.getUserSubscription(session.user.id);
      if (!subStatus.isPro && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Настройка персонального адреса визитки доступна на тарифе Pro' },
          { status: 403 }
        );
      }

      const slugCheck = isValidCustomSlug(data.slug);
      if (!slugCheck.valid) {
        return NextResponse.json({ error: slugCheck.error }, { status: 400 });
      }

      const existingSlug = await prisma.card.findFirst({
        where: {
          slug: data.slug.toLowerCase().trim(),
          id: { not: card.id },
        },
      });

      if (existingSlug) {
        return NextResponse.json({ error: 'Этот адрес уже занят' }, { status: 400 });
      }

      slug = data.slug.toLowerCase().trim();
    }

    // Update in transaction
    const updatedCard = await prisma.$transaction(async (tx) => {
      const updated = await tx.card.update({
        where: { id: card.id },
        data: {
          slug,
          fullName: data.fullName,
          position: data.position || null,
          companyName: data.companyName || null,
          bio: data.bio || null,
          avatarUrl: data.avatarUrl || null,
          coverUrl: data.coverUrl || null,
          templateId: data.templateId,
          themeConfig: data.themeConfig,
          published: data.published,
          isIndexed: data.isIndexed,
        },
      });

      // Synchronize fields: delete existing and insert new
      await tx.cardField.deleteMany({ where: { cardId: card.id } });

      if (data.fields && data.fields.length > 0) {
        await tx.cardField.createMany({
          data: data.fields.map((f, index) => ({
            cardId: card.id,
            type: f.type,
            label: f.label,
            value: f.value,
            visible: f.visible,
            sortOrder: f.sortOrder ?? index,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          companyId: card.companyId,
          targetType: 'Card',
          targetId: card.id,
          action: 'CARD_UPDATED',
          details: { updatedFields: Object.keys(data) },
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, card: updatedCard });
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json({ error: 'Ошибка при сохранении визитки' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { id } = await params;
    const card = await getAuthorizedCard(id, session.user.id, session.user.role);

    if (!card) {
      return NextResponse.json({ error: 'Визитка не найдена или нет прав на удаление' }, { status: 403 });
    }

    // Soft delete (Section 5 requirement)
    await prisma.$transaction([
      prisma.card.update({
        where: { id: card.id },
        data: { deletedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          companyId: card.companyId,
          targetType: 'Card',
          targetId: card.id,
          action: 'CARD_DELETED',
          details: { slug: card.slug },
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Визитка перемещена в архив' });
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json({ error: 'Ошибка при удалении визитки' }, { status: 500 });
  }
}
