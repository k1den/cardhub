import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQrSvg, generateQrPngDataUrl } from '@/lib/cards/qr';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'svg';

    const card = await prisma.card.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        published: true,
      },
    });

    if (!card || !card.published) {
      return NextResponse.json({ error: 'Визитка не найдена' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const targetUrl = `${appUrl}/c/${card.slug}?s=qr`;

    if (format === 'png') {
      const dataUrl = await generateQrPngDataUrl(targetUrl, 1024);
      return NextResponse.json({ dataUrl, targetUrl });
    }

    // Default SVG
    const svg = await generateQrSvg(targetUrl);

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Ошибка генерации QR-кода' }, { status: 500 });
  }
}
