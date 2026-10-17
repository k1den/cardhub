import 'dotenv/config';
import { runMaintenance } from '../lib/maintenance/service';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  let retentionDays = 30;
  const retentionIdx = args.indexOf('--retention');
  if (retentionIdx !== -1 && args[retentionIdx + 1]) {
    retentionDays = parseInt(args[retentionIdx + 1], 10) || 30;
  }

  console.log('====================================================');
  console.log('🛠️  CardHub: Запуск планового фонового обслуживания');
  console.log(`⏰  Время: ${new Date().toLocaleString('ru-RU')}`);
  console.log(`🔍  Режим: ${dryRun ? 'DRY-RUN (только проверка, без изменений)' : 'LIVE (боевое выполнение)'}`);
  console.log(`⏳  Срок хранения удаленных аккаунтов (152-ФЗ): ${retentionDays} дн.`);
  console.log('====================================================');

  const report = await runMaintenance({ dryRun, retentionDays });

  console.log('');
  console.log('📊 Результаты обслуживания:');
  console.log(` • Истекших сессий удалено:             ${report.expiredSessionsDeleted}`);
  console.log(` • Истекших email-токенов удалено:      ${report.expiredTokensDeleted}`);
  console.log(` • Аккаунтов стерто по 152-ФЗ (>30 дн): ${report.usersHardDeleted}`);
  console.log(` • Файлов удалено с диска:              ${report.filesRemoved}`);
  console.log(` • Подписок переведено в PAST_DUE:       ${report.subscriptionsPastDue}`);
  console.log(` • Подписок завершено (EXPIRED):        ${report.subscriptionsExpired}`);
  console.log(` • Лишних визиток скрыто (лимит Free):   ${report.excessCardsHidden}`);
  console.log('====================================================');
  console.log('✅ Регламентное обслуживание успешно завершено.');
  console.log('====================================================');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Ошибка во время регламентного обслуживания:', err);
  process.exit(1);
});
