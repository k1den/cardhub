import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';
import { z } from 'zod';

const reportSchema = z.object({
  slug: z.string().min(1),
  reason: z.string().min(2, 'Укажите причину жалобы').max(200),
  details: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate limiting: 3 reports per 15 minutes per IP
    const rl = await rateLimit(`report:${ip}`, { limit: 3, windowSeconds: 900 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Слишком много обращений. Пожалуйста, повторите позже.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = reportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Некорректные данные жалобы' }, { status: 400 });
    }

    const { slug, reason, details } = result.data;

    const card = await prisma.card.findFirst({
      where: {
        OR: [{ id: slug }, { slug }],
        deletedAt: null,
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Визитка не найдена' }, { status: 404 });
    }

    await prisma.report.create({
      data: {
        cardId: card.id,
        reason,
        details: details || null,
        reporterIp: ip,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Ваша жалоба принята и будет рассмотрена модератором платформы.',
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
