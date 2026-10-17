import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { generateTotpSecret, generateOtpAuthUri, encryptSecret } from '@/lib/security/totp';
import { generateQrPngDataUrl } from '@/lib/cards/qr';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const secret = generateTotpSecret();
    const otpAuthUri = generateOtpAuthUri(secret, user.email);
    const qrCodeUrl = await generateQrPngDataUrl(otpAuthUri, 300);

    const secretEncrypted = encryptSecret(secret);

    // Save or update pending TOTP secret in DB
    await prisma.totpSecret.upsert({
      where: { userId: user.id },
      update: { secretEncrypted },
      create: {
        userId: user.id,
        secretEncrypted,
      },
    });

    return NextResponse.json({
      success: true,
      secret,
      otpAuthUri,
      qrCodeUrl,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Ошибка при настройке двухфакторной аутентификации' },
      { status: 500 }
    );
  }
}
