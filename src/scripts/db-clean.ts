import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../lib/prisma';

async function cleanUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    const files = await fs.readdir(uploadsDir);
    let deletedCount = 0;

    for (const file of files) {
      if (file !== '.gitkeep') {
        const fullPath = path.join(uploadsDir, file);
        await fs.unlink(fullPath).catch(() => {});
        deletedCount++;
      }
    }
    return deletedCount;
  } catch {
    return 0;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isForce = args.includes('--force');

  console.log('====================================================');
  console.log('🧹 CardHub: Очистка тестовых данных перед запуском');
  console.log('====================================================');

  if (!isForce) {
    console.warn('');
    console.warn('⚠️  ВНИМАНИЕ: Данная команда полностью удалит:');
    console.warn('   • Всех пользователей и сессии');
    console.warn('   • Все цифровые визитки и их поля');
    console.warn('   • Все компании и членства');
    console.warn('   • Все платежи, подписки и жалобы');
    console.warn('   • Все загруженные тестовые файлы');
    console.warn('   (Тарифные планы REGULAR и PRO будут сохранены).');
    console.warn('');
    console.warn('Для подтверждения очистки запустите команду с флагом --force:');
    console.warn('👉 npm run db:clean -- --force');
    console.warn('');
    console.log('====================================================');
    process.exit(0);
  }

  console.log('⏳ Выполняется очистка таблиц базы данных...');

  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.cardEvent.deleteMany(),
    prisma.report.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.cardField.deleteMany(),
    prisma.card.deleteMany(),
    prisma.membership.deleteMany(),
    prisma.invitation.deleteMany(),
    prisma.company.deleteMany(),
    prisma.consent.deleteMany(),
    prisma.emailToken.deleteMany(),
    prisma.totpSecret.deleteMany(),
    prisma.file.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log('🗑️  Очистка загруженных файлов из public/uploads...');
  const filesDeleted = await cleanUploadsDir();

  console.log('🌱 Проверка и восстановление системных планов подписок...');
  await prisma.plan.upsert({
    where: { code: 'REGULAR' },
    update: {},
    create: {
      code: 'REGULAR',
      name: 'Обычный',
      description: '1 цифровая визитка, ссылка, QR-код, запись на NFC-метку и скачивание vCard.',
      priceMonth: 290,
      priceYear: 2900,
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

  await prisma.plan.upsert({
    where: { code: 'PRO' },
    update: {},
    create: {
      code: 'PRO',
      name: 'Pro (Корпоративный)',
      description: 'Компания, визитки сотрудников, единый корпоративный брендинг, красивый slug и аудит.',
      priceMonth: 1490,
      priceYear: 14900,
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

  console.log('');
  console.log('====================================================');
  console.log('✅ База данных полностью очищена от тестовых данных!');
  console.log(`📁 Удалено загруженных файлов: ${filesDeleted}`);
  console.log('✨ Системные тарифные планы REGULAR и PRO активны.');
  console.log('👉 Теперь зарегистрируйте ваш боевой аккаунт и выполните:');
  console.log('   npm run admin:promote ваш-email@domain.ru');
  console.log('====================================================');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Ошибка при очистке базы данных:', err);
  process.exit(1);
});
