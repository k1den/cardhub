import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventSource } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const card = await prisma.card.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
      select: {
        id: true,
        published: true,
      },
    });

    if (!card || !card.published) {
      return NextResponse.json({ error: 'Визитка не найдена' }, { status: 404 });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.cardEvent.upsert({
      where: {
        cardId_date_source: {
          cardId: card.id,
          date: today,
          source: EventSource.DIRECT,
        },
      },
      update: {
        clicksCount: { increment: 1 },
      },
      create: {
        cardId: card.id,
        date: today,
        source: EventSource.DIRECT,
        clicksCount: 1,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Record click error:', error);
    return NextResponse.json({ error: 'Не удалось зафиксировать клик' }, { status: 500 });
  }
}
