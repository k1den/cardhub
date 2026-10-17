import 'dotenv/config';
import { sendEmail } from '../lib/email/sender';

async function main() {
  const targetEmail = process.argv[2] || process.env.SMTP_USER;

  if (!targetEmail) {
    console.error('Пожалуйста, укажите email для отправки тестового письма:');
    console.error('Пример: npx tsx src/scripts/test-email.ts my-test-email@mail.ru');
    process.exit(1);
  }

  console.log(`Проверка подключения к SMTP ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`);
  console.log(`Отправитель: ${process.env.SMTP_USER}`);
  console.log(`Получатель: ${targetEmail}`);

  const success = await sendEmail({
    to: targetEmail,
    subject: 'Тестовое письмо от CardHub (Rambler SMTP)',
    text: 'Здравствуйте! Если вы читаете это письмо, отправка почты через SMTP настроена успешно и готова к работе.',
    html: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #0b1120; color: #fff; border-radius: 12px;">
        <h2 style="color: #38bdf8;"> CardHub: Почта успешно настроена!</h2>
        <p>Тестовое сообщение через сервер <strong>${process.env.SMTP_HOST}</strong> доставлено успешно.</p>
        <p style="color: #94a3b8; font-size: 13px;">Теперь письма с подтверждением регистрации и сбросом пароля будут отправляться автоматически.</p>
      </div>
    `,
  });

  if (success) {
    console.log('✅ Письмо успешно отправлено! Проверьте входящие (или папку Спам) адреса:', targetEmail);
  } else {
    console.error('❌ Не удалось отправить письмо. Проверьте правильность логина и пароля в .env');
  }

  process.exit(success ? 0 : 1);
}

main().catch((err) => {
  console.error('Ошибка выполнения:', err);
  process.exit(1);
});
