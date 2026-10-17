import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { cardFormSchema } from '@/lib/validations/card';
import { generateRandomSlug, isValidCustomSlug } from '@/lib/cards/slug';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const cards = await prisma.card.findMany({
      where: {
        ownerId: session.user.id,
        deletedAt: null,
      },
      include: {
        fields: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, cards });
  } catch (error) {
    console.error('Fetch cards error:', error);
    return NextResponse.json({ error: 'Ошибка при получении визиток' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
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

    // Check plan limits (Section 3: "Обычный" allows 1 card)
    const activeCardsCount = await prisma.card.count({
      where: {
        ownerId: session.user.id,
        deletedAt: null,
      },
    });

    if (session.user.role === 'USER' && activeCardsCount >= 1) {
      return NextResponse.json(
        {
          error:
            'На тарифе «Обычный» доступно создание 1 визитки. Перейдите на тариф Pro для создания дополнительных визиток.',
        },
        { status: 403 }
      );
    }

    // Determine slug
    let slug = '';
    if (data.slug && session.user.role !== 'USER') {
      // Pro user custom slug
      const check = isValidCustomSlug(data.slug);
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }

      const existingSlug = await prisma.card.findUnique({
        where: { slug: data.slug.toLowerCase().trim() },
      });
      if (existingSlug) {
        return NextResponse.json({ error: 'Этот адрес визитки уже занят' }, { status: 400 });
      }
      slug = data.slug.toLowerCase().trim();
    } else {
      // Generate unique random 8-char slug
      let attempts = 0;
      while (attempts < 10) {
        const candidate = generateRandomSlug(8);
        const existing = await prisma.card.findUnique({ where: { slug: candidate } });
        if (!existing) {
          slug = candidate;
          break;
        }
        attempts++;
      }
      if (!slug) {
        slug = generateRandomSlug(10);
      }
    }

    // Create card with fields in a transaction
    const newCard = await prisma.$transaction(async (tx) => {
      const card = await tx.card.create({
        data: {
          ownerId: session.user.id,
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
          targetType: 'Card',
          targetId: card.id,
          action: 'CARD_CREATED',
          details: { slug: card.slug, fullName: card.fullName },
        },
      });

      return card;
    });

    return NextResponse.json({ success: true, card: newCard }, { status: 201 });
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json({ error: 'Ошибка при создании визитки' }, { status: 500 });
  }
}
