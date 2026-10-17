import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const userWithDetails = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        totpEnabled: true,
        createdAt: true,
        memberships: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
        cards: {
          where: { deletedAt: null },
          select: {
            id: true,
            slug: true,
            fullName: true,
            published: true,
            templateId: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!userWithDetails) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: userWithDetails,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при проверке сессии' },
      { status: 500 }
    );
  }
}
