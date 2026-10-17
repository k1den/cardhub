import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial subscription plans...');

  const regularPlan = await prisma.plan.upsert({
    where: { code: 'REGULAR' },
    update: {},
    create: {
      code: 'REGULAR',
      name: 'Обычный',
      description: '1 цифровая визитка, ссылка, QR-код, запись на NFC-метку и скачивание vCard.',
      priceMonth: 290, // в рублях (290 ₽/мес)
      priceYear: 2900, // 2900 ₽/год (скидка ~17%)
      maxCards: 1,
      maxMembers: 0,
      features: {
        templates: ['modern', 'minimal', 'corporate'],
        nfcSupport: true,
        qrDownload: true,
        vcardExport: true,
        basicStats: true,
      },
      isActive: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { code: 'PRO' },
    update: {},
    create: {
      code: 'PRO',
      name: 'Pro (Корпоративный)',
      description: 'Компания, визитки сотрудников, единый корпоративный брендинг, красивый slug и аудит.',
      priceMonth: 1490, // в рублях (1490 ₽/мес)
      priceYear: 14900, // 14900 ₽/год
      maxCards: 10,
      maxMembers: 10,
      features: {
        companyBranding: true,
        employeeCards: true,
        customSlug: true,
        advancedStats: true,
        auditLog: true,
        batchNfcExport: true,
      },
      isActive: true,
    },
  });

  console.log('Seeded plans:', { regular: regularPlan.code, pro: proPlan.code });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
