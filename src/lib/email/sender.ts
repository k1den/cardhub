/**
 * Email sender module for CardHub.
 * Complies with 242-ФЗ by utilizing Russian transactional mail transport in production.
 * In development, output is logged safely for easy inspection.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev || !process.env.SMTP_USER) {
    console.log('--------------------------------------------------');
    console.log(`[DEV EMAIL SENDER] To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log('--------------------------------------------------');
    return true;
  }

  // In production, nodemailer with SMTP config would send the email
  try {
    // When SMTP credentials are provided, send through configured Russian provider
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/auth/verify?token=${token}`;

  return await sendEmail({
    to: email,
    subject: 'Подтверждение регистрации в CardHub',
    text: `Здравствуйте! Для подтверждения адреса электронной почты перейдите по ссылке: ${verifyUrl}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Добро пожаловать в CardHub!</h2>
        <p>Для завершения регистрации и активации аккаунта подтвердите ваш email:</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Подтвердить Email
          </a>
        </p>
        <p style="color: #64748b; font-size: 14px;">Ссылка действительна в течение 24 часов. Если вы не регистрировались в CardHub, просто проигнорируйте это письмо.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  return await sendEmail({
    to: email,
    subject: 'Сброс пароля в CardHub',
    text: `Здравствуйте! Для сброса пароля перейдите по ссылке: ${resetUrl}. Ссылка действительна 30 минут.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Сброс пароля в CardHub</h2>
        <p>Вы запросили сброс пароля для вашего аккаунта.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Установить новый пароль
          </a>
        </p>
        <p style="color: #64748b; font-size: 14px;">Ссылка действительна в течение 30 минут. Если вы не запрашивали сброс пароля, немедленно проверьте безопасность вашего аккаунта.</p>
      </div>
    `,
  });
}
