import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/guard';

export async function GET(request: NextRequest) {
  const { authorized, response } = await requireAdmin();
  if (!authorized) return response;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');

  let whereClause: any = {};
  if (statusParam && statusParam !== 'ALL') {
    whereClause.status = statusParam;
  }

  try {
    const reports = await prisma.report.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        card: {
          select: {
            id: true,
            slug: true,
            title: true,
            fullName: true,
            published: true,
            owner: {
              select: {
                id: true,
                email: true,
                role: true,
                deletedAt: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ reports });
  } catch (err: any) {
    console.error('Error fetching admin reports:', err);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
