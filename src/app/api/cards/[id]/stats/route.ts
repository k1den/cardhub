import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { EventSource } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { id } = await params;

    // Check card ownership (Anti-IDOR)
    const card = await prisma.card.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Визитка не найдена' }, { status: 404 });
    }

    const isOwner = card.ownerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Нет доступа к статистике этой визитки' }, { status: 403 });
    }

    // Fetch stats for the last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setUTCHours(0, 0, 0, 0);

    const events = await prisma.cardEvent.findMany({
      where: {
        cardId: card.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Aggregates
    let totalViews = 0;
    let nfcViews = 0;
    let qrViews = 0;
    let directViews = 0;
    let totalVCardDownloads = 0;
    let totalClicks = 0;

    // Daily breakdown mapping
    const dailyMap = new Map<string, { date: string; views: number; nfc: number; qr: number; direct: number; vcard: number; clicks: number }>();

    // Pre-populate last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap.set(dateStr, { date: dateStr, views: 0, nfc: 0, qr: 0, direct: 0, vcard: 0, clicks: 0 });
    }

    events.forEach((ev) => {
      totalViews += ev.viewsCount;
      totalVCardDownloads += ev.vcardDownloads;
      totalClicks += ev.clicksCount;

      if (ev.source === EventSource.NFC) nfcViews += ev.viewsCount;
      else if (ev.source === EventSource.QR) qrViews += ev.viewsCount;
      else directViews += ev.viewsCount;

      const dateStr = ev.date.toISOString().split('T')[0];
      const entry = dailyMap.get(dateStr) || { date: dateStr, views: 0, nfc: 0, qr: 0, direct: 0, vcard: 0, clicks: 0 };
      entry.views += ev.viewsCount;
      entry.vcard += ev.vcardDownloads;
      entry.clicks += ev.clicksCount;
      if (ev.source === EventSource.NFC) entry.nfc += ev.viewsCount;
      else if (ev.source === EventSource.QR) entry.qr += ev.viewsCount;
      else entry.direct += ev.viewsCount;
      dailyMap.set(dateStr, entry);
    });

    const dailyBreakdown = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      card: {
        id: card.id,
        slug: card.slug,
        fullName: card.fullName,
      },
      summary: {
        totalViews,
        nfcViews,
        qrViews,
        directViews,
        totalVCardDownloads,
        totalClicks,
      },
      dailyBreakdown,
    });
  } catch (error) {
    console.error('Card stats error:', error);
    return NextResponse.json({ error: 'Ошибка при получении аналитики' }, { status: 500 });
  }
}
