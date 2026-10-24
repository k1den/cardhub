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
      <!DOCTYPE html>
      <html lang="ru">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>CardHub SMTP Test</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0C0F17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0C0F17; min-height: 100vh; padding: 36px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #141720; border: 1px solid #262D3D; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55);">
                  <!-- Amber Top Bar -->
                  <tr>
                    <td style="height: 3px; background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%); font-size: 0; line-height: 0;">
                      &nbsp;
                    </td>
                  </tr>

                  <!-- Content Area -->
                  <tr>
                    <td style="padding: 36px 28px 30px;">
                      <!-- Brand Logo & Header -->
                      <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; width: 46px; height: 46px; line-height: 46px; background: linear-gradient(135deg, #d97706, #ea580c); border-radius: 14px; color: #ffffff; font-weight: 900; font-size: 19px; box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35); border: 1px solid rgba(251, 191, 36, 0.4); text-align: center;">
                          CH
                        </div>
                        <h1 style="color: #ffffff; margin: 14px 0 4px; font-size: 24px; font-weight: 800; letter-spacing: -0.4px;">
                          CardHub: Почта успешно настроена!
                        </h1>
                        <p style="color: #a8a29e; font-size: 13px; margin: 0; font-weight: 500;">
                          Сервис современных цифровых NFC-визиток
                        </p>
                      </div>

                      <!-- Inner Message Card -->
                      <div style="background-color: #0E1119; padding: 24px; border-radius: 14px; border: 1px solid #1F2637; margin-bottom: 24px;">
                        <p style="color: #d6d3d1; font-size: 14px; line-height: 1.65; margin: 0 0 16px;">
                          Тестовое сообщение через сервер <strong style="color: #f59e0b;">${process.env.SMTP_HOST}</strong> доставлено успешно.
                        </p>
                        <p style="color: #a8a29e; font-size: 13px; line-height: 1.5; margin: 0;">
                          Теперь письма с подтверждением регистрации и сбросом пароля отправляются автоматически в едином фирменном стиле CardHub.
                        </p>
                      </div>

                      <!-- Legal Footer -->
                      <div style="border-top: 1px solid #1F2637; padding-top: 18px; font-size: 11px; color: #78716c; text-align: center; line-height: 1.6;">
                        Соответствует 152-ФЗ и 242-ФЗ • CardHub © 2026
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
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
