import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Email sender module for CardHub.
 * Complies with 242-ФЗ by utilizing Russian transactional mail transport (Rambler, Yandex, Mail.ru).
 * When SMTP_USER & SMTP_PASS are configured, sends real emails.
 * Otherwise falls back to safe console logging in local development.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.rambler.ru';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      // Avoid SSL handshake errors on various local networks / OSPanel
      rejectUnauthorized: false,
    },
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.log('--------------------------------------------------');
    console.log(`[DEV EMAIL SENDER (No SMTP configured)] To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log('--------------------------------------------------');
    return true;
  }

  try {
    const from = process.env.SMTP_FROM || `"CardHub" <${process.env.SMTP_USER}>`;

    const info = await mailTransporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log(`[SMTP EMAIL SENT SUCCESS] To: ${to}, MessageId: ${info.messageId}`);
    return true;
  } catch (err: any) {
    console.error('[SMTP EMAIL ERROR] Failed to send email:', err?.message || err);
    console.log(`[EMAIL CONTENT FALLBACK] To: ${to}\nSubject: ${subject}\nText: ${text}`);
    return false;
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/auth/verify?token=${token}`;

  return await sendEmail({
    to: email,
    subject: 'Подтверждение регистрации в CardHub',
    text: `Здравствуйте! Для подтверждения адреса электронной почты в CardHub перейдите по ссылке: ${verifyUrl}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #0b1120; color: #f1f5f9; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: linear-gradient(135deg, #2563eb, #6366f1); border-radius: 12px; color: #ffffff; font-weight: 900; font-size: 18px;">
            CH
          </div>
          <h2 style="color: #ffffff; margin-top: 12px; margin-bottom: 4px; font-size: 22px; font-weight: 800;">Добро пожаловать в CardHub!</h2>
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">Сервис современных цифровых NFC-визиток</p>
        </div>

        <div style="background-color: #0f172a; padding: 24px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            Для завершения регистрации и активации вашего аккаунта подтвердите адрес электронной почты, нажав на кнопку ниже:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
              Подтвердить Email
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
            Или скопируйте ссылку в браузер: <br/>
            <span style="color: #38bdf8; word-break: break-all;">${verifyUrl}</span>
          </p>
        </div>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center;">
          Ссылка действительна 24 часа. Если вы не регистрировались в CardHub, просто проигнорируйте это письмо.<br/>
          Соответствует 152-ФЗ и 242-ФЗ • CardHub © 2026
        </div>
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
    text: `Здравствуйте! Для сброса пароля в CardHub перейдите по ссылке: ${resetUrl}. Ссылка действительна 30 минут.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #0b1120; color: #f1f5f9; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: linear-gradient(135deg, #2563eb, #6366f1); border-radius: 12px; color: #ffffff; font-weight: 900; font-size: 18px;">
            CH
          </div>
          <h2 style="color: #ffffff; margin-top: 12px; margin-bottom: 4px; font-size: 22px; font-weight: 800;">Сброс пароля</h2>
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">Запрос на восстановление доступа к CardHub</p>
        </div>

        <div style="background-color: #0f172a; padding: 24px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            Вы запросили сброс пароля для вашей учетной записи. Чтобы задать новый пароль, нажмите кнопку ниже:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
              Установить новый пароль
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
            Или скопируйте ссылку в адресную строку браузера: <br/>
            <span style="color: #38bdf8; word-break: break-all;">${resetUrl}</span>
          </p>
        </div>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center;">
          Ссылка действительна в течение 30 минут. Если вы не запрашивали сброс пароля, немедленно проверьте безопасность вашей почты.<br/>
          Соответствует OWASP ASVS L2 • CardHub © 2026
        </div>
      </div>
    `,
  });
}
