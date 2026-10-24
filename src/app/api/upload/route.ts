import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { processAndSaveImage } from '@/lib/uploads/image-processor';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const ip = getClientIp(req);
    const rl = await rateLimit(`upload:${session.user.id}:${ip}`, { limit: 20, windowSeconds: 600 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Слишком много загрузок. Пожалуйста, подождите.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as 'avatar' | 'cover' | 'logo') || 'avatar';

    if (!file) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    if (type !== 'avatar' && type !== 'cover' && type !== 'logo') {
      return NextResponse.json({ error: 'Неверный тип изображения' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await processAndSaveImage(buffer, type);

    // Save record to DB
    await prisma.file.create({
      data: {
        userId: session.user.id,
        filePath: result.url,
        originalName: file.name,
        mimeType: result.mimeType,
        sizeBytes: result.sizeBytes,
      },
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при обработке изображения' },
      { status: 400 }
    );
  }
}
