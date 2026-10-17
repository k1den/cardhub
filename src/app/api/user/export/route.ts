import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all user personal data in compliance with Article 14 152-FZ
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        totpEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const cards = await prisma.card.findMany({
      where: { ownerId: userId, deletedAt: null },
      include: {
        fields: true,
      },
    });

    const consents = await prisma.consent.findMany({
      where: { userId },
      select: {
        consentType: true,
        documentVersion: true,
        createdAt: true,
        ipAddress: true,
      },
    });

    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        company: {
          select: { id: true, name: true, website: true },
        },
      },
    });

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
      },
    });

    const payments = await prisma.payment.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        provider: true,
        receiptUrl: true,
        createdAt: true,
      },
    });

    const auditLogs = await prisma.auditLog.findMany({
      where: { actorId: userId },
      select: {
        action: true,
        targetType: true,
        details: true,
        createdAt: true,
      },
    });

    const exportData = {
      format: 'CardHub 152-FZ Personal Data Export',
      exportedAt: new Date().toISOString(),
      user,
      cards,
      consents,
      memberships,
      subscriptions,
      payments,
      auditLogs,
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="cardhub-personal-data.json"',
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Ошибка при формировании выгрузки персональных данных' },
      { status: 500 }
    );
  }
}
