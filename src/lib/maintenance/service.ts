import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/prisma';
import { Prisma, SubscriptionStatus } from '@prisma/client';

export interface MaintenanceOptions {
  dryRun?: boolean;
  retentionDays?: number;
}

export interface MaintenanceReport {
  timestamp: string;
  dryRun: boolean;
  expiredSessionsDeleted: number;
  expiredTokensDeleted: number;
  usersHardDeleted: number;
  filesRemoved: number;
  subscriptionsPastDue: number;
  subscriptionsExpired: number;
  excessCardsHidden: number;
}

export async function runMaintenance(options: MaintenanceOptions = {}): Promise<MaintenanceReport> {
  const { dryRun = false, retentionDays = 30 } = options;
  const now = new Date();
  const retentionCutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  const report: MaintenanceReport = {
    timestamp: now.toISOString(),
    dryRun,
    expiredSessionsDeleted: 0,
    expiredTokensDeleted: 0,
    usersHardDeleted: 0,
    filesRemoved: 0,
    subscriptionsPastDue: 0,
    subscriptionsExpired: 0,
    excessCardsHidden: 0,
  };

  // 1. Purge expired sessions
  const expiredSessionsCount = await prisma.session.count({
    where: { expiresAt: { lt: now } },
  });
  report.expiredSessionsDeleted = expiredSessionsCount;
  if (!dryRun && expiredSessionsCount > 0) {
    await prisma.session.deleteMany({
      where: { expiresAt: { lt: now } },
    });
  }

  // 2. Purge expired email verification / reset tokens
  const expiredTokensCount = await prisma.emailToken.count({
    where: { expiresAt: { lt: now } },
  });
  report.expiredTokensDeleted = expiredTokensCount;
  if (!dryRun && expiredTokensCount > 0) {
    await prisma.emailToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });
  }

  // 3. 152-ФЗ ст. 21: Hard delete users whose soft-delete retention period (30 days) has passed
  const expiredUsers = await prisma.user.findMany({
    where: {
      deletedAt: {
        lte: retentionCutoff,
      },
    },
    include: {
      files: true,
    },
  });

  report.usersHardDeleted = expiredUsers.length;

  if (!dryRun) {
    for (const user of expiredUsers) {
      // Remove physical files from disk
      for (const file of user.files) {
        if (file.filePath) {
          try {
            // Local upload path resolution
            const fullPath = path.isAbsolute(file.filePath)
              ? file.filePath
              : path.join(process.cwd(), 'public', file.filePath.replace(/^\//, ''));
            await fs.unlink(fullPath).catch(() => {});
            report.filesRemoved++;
          } catch {
            // Ignore if already deleted
          }
        }
      }

      // Hard delete user from DB (cascades cards, sessions, memberships, files)
      await prisma.user.delete({
        where: { id: user.id },
      });

      // Audit log entry for 152-ФЗ compliance verification
      await prisma.auditLog.create({
        data: {
          targetType: 'USER',
          targetId: user.id,
          action: '152FZ_USER_HARD_DELETED',
          details: {
            email: user.email,
            deletedAt: user.deletedAt?.toISOString(),
            retentionDays,
          },
        },
      });
    }
  }

  // 4. Subscriptions maintenance: transition expired or past due subscriptions
  const activeSubsDue = await prisma.subscription.findMany({
    where: {
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PAST_DUE] },
      currentPeriodEnd: { lte: now },
    },
  });

  for (const sub of activeSubsDue) {
    const isPastDue = sub.gracePeriodEnd ? sub.gracePeriodEnd > now : false;

    if (isPastDue) {
      report.subscriptionsPastDue++;
      if (!dryRun) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: SubscriptionStatus.PAST_DUE },
        });
      }
    } else {
      report.subscriptionsExpired++;
      if (!dryRun) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: SubscriptionStatus.EXPIRED },
        });

        // Enforce 1-card limit for expired subscriber: unpublish extra cards
        const userCards = await prisma.card.findMany({
          where: { ownerId: sub.userId, published: true, deletedAt: null },
          orderBy: { createdAt: 'asc' },
        });

        if (userCards.length > 1) {
          const cardsToHide = userCards.slice(1);
          await prisma.card.updateMany({
            where: { id: { in: cardsToHide.map((c) => c.id) } },
            data: { published: false },
          });
          report.excessCardsHidden += cardsToHide.length;
        }
      }
    }
  }

  // 5. Audit log maintenance execution
  if (!dryRun) {
    await prisma.auditLog.create({
      data: {
        targetType: 'SYSTEM',
        targetId: 'CRON_MAINTENANCE',
        action: 'SYSTEM_MAINTENANCE_RUN',
        details: report as unknown as Prisma.InputJsonValue,
      },
    }).catch(() => {});
  }

  return report;
}
