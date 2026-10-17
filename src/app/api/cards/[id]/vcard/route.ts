import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVCard3 } from '@/lib/cards/vcard';
import { CardFieldType } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Search by ID or slug
    const card = await prisma.card.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
      include: {
        fields: {
          where: { visible: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!card || !card.published) {
      return NextResponse.json({ error: 'Визитка не найдена' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const cardUrl = `${appUrl}/c/${card.slug}`;

    const phones = card.fields.filter((f) => f.type === CardFieldType.PHONE).map((f) => f.value);
    const emails = card.fields.filter((f) => f.type === CardFieldType.EMAIL).map((f) => f.value);
    const websites = card.fields.filter((f) => f.type === CardFieldType.WEBSITE).map((f) => f.value);
    const addressField = card.fields.find((f) => f.type === CardFieldType.ADDRESS);
    const tgField = card.fields.find((f) => f.type === CardFieldType.TELEGRAM);
    const waField = card.fields.find((f) => f.type === CardFieldType.WHATSAPP);
    const vkField = card.fields.find((f) => f.type === CardFieldType.VK);

    const vcardContent = generateVCard3({
      fullName: card.fullName,
      position: card.position,
      companyName: card.companyName,
      bio: card.bio,
      phones,
      emails,
      websites,
      address: addressField?.value,
      telegram: tgField?.value,
      whatsapp: waField?.value,
      vk: vkField?.value,
      cardUrl,
    });

    // Record stats (increment vcardDownloads for today)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.cardEvent.upsert({
      where: {
        cardId_date_source: {
          cardId: card.id,
          date: today,
          source: 'DIRECT',
        },
      },
      update: {
        vcardDownloads: { increment: 1 },
      },
      create: {
        cardId: card.id,
        date: today,
        source: 'DIRECT',
        vcardDownloads: 1,
      },
    }).catch(() => {});

    // Encode filename safely in Content-Disposition
    const filename = `${card.slug}.vcf`;

    return new Response(vcardContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('vCard download error:', error);
    return NextResponse.json({ error: 'Ошибка при формировании vCard' }, { status: 500 });
  }
}
