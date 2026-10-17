import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const targetEmail = process.argv[2]?.trim().toLowerCase();

  if (!targetEmail) {
    console.error('');
    console.error('❌ Ошибка: укажите email пользователя.');
    console.error('Использование: npm run admin:promote <email>');
    console.error('Пример:        npm run admin:promote admin@cardhub.ru');
    console.error('');
    process.exit(1);
  }

  console.log(`🔍 Поиск пользователя с email: ${targetEmail}...`);

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!user) {
    console.error('');
    console.error(`❌ Пользователь ${targetEmail} не найден в базе данных.`);
    console.error('Сначала зарегистрируйтесь на сайте через страницу регистрации:');
    console.error('👉 http://localhost:3000/auth/register');
    console.error('');
    process.exit(1);
  }

  const proPlan = await prisma.plan.findUnique({ where: { code: 'PRO' } });
  const oneYearAhead = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    // 1. Promote to ADMIN and verify email
    await tx.user.update({
      where: { id: user.id },
      data: {
        role: 'ADMIN',
        emailVerified: true,
      },
    });

    // 2. Grant 1-year PRO subscription for company & card testing
    if (proPlan) {
      const existingSub = await tx.subscription.findFirst({
        where: { userId: user.id },
      });

      if (existingSub) {
        await tx.subscription.update({
          where: { id: existingSub.id },
          data: {
            planId: proPlan.id,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: oneYearAhead,
            autoRenew: false,
          },
        });
      } else {
        await tx.subscription.create({
          data: {
            userId: user.id,
            planId: proPlan.id,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: oneYearAhead,
            autoRenew: false,
            providerPaymentId: `admin_bootstrap_${Date.now()}`,
          },
        });
      }
    }

    // 3. Log audit event
    await tx.auditLog.create({
      data: {
        actorId: user.id,
        targetType: 'USER',
        targetId: user.id,
        action: 'BOOTSTRAP_ADMIN_GRANTED',
        details: { email: user.email, previousRole: user.role },
      },
    });
  });

  console.log('');
  console.log('====================================================');
  console.log(`✅ Пользователю ${targetEmail} успешно назначена роль ADMIN!`);
  console.log(' • Статус: Суперадминистратор платформы (полный доступ к /admin)');
  console.log(' • Email подтвержден: ДА');
  console.log(' • Pro-подписка активирована: ДА (до ' + oneYearAhead.toLocaleDateString('ru-RU') + ')');
  console.log('====================================================');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Ошибка при назначении администратора:', err);
  process.exit(1);
});
