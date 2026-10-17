import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/guard';

export async function GET(request: NextRequest) {
  const { authorized, response } = await requireAdmin();
  if (!authorized) return response;

  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get('targetType');
  const action = searchParams.get('action');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  let whereClause: any = {};
  if (targetType) whereClause.targetType = targetType;
  if (action) whereClause.action = action;

  try {
    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error('Error fetching admin audit logs:', err);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
