import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/guard';

export async function GET() {
  const { authorized, response } = await requireAdmin();
  if (!authorized) return response;

  try {
    const [
      totalUsers,
      verifiedUsers,
      totalCards,
      publishedCards,
      totalCompanies,
      activeSubscriptions,
      pendingReports,
      revenueResult,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { emailVerified: true, deletedAt: null } }),
      prisma.card.count(),
      prisma.card.count({ where: { published: true } }),
      prisma.company.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCEEDED' },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, email: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalUsers,
        verifiedUsers,
        totalCards,
        publishedCards,
        totalCompanies,
        activeSubscriptions,
        pendingReports,
        totalRevenueRub: revenueResult._sum.amount || 0,
      },
      recentAuditLogs,
    });
  } catch (err: any) {
    console.error('Error fetching admin overview:', err);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
