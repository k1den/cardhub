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

interface CardHubEmailTemplateOptions {
  title: string;
  subtitle: string;
  description: string;
  actionText: string;
  actionUrl: string;
  footerNote: string;
  legalNote: string;
}

function renderCardHubEmail({
  title,
  subtitle,
  description,
  actionText,
  actionUrl,
  footerNote,
  legalNote,
}: CardHubEmailTemplateOptions): string {
  return `
    <!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0C0F17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0C0F17; min-height: 100vh; padding: 36px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #141720; border: 1px solid #262D3D; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55);">
                <!-- Glowing Amber Brand Top Bar -->
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
                        ${title}
                      </h1>
                      <p style="color: #a8a29e; font-size: 13px; margin: 0; font-weight: 500;">
                        ${subtitle}
                      </p>
                    </div>

                    <!-- Inner Message Card -->
                    <div style="background-color: #0E1119; padding: 24px; border-radius: 14px; border: 1px solid #1F2637; margin-bottom: 24px;">
                      <p style="color: #d6d3d1; font-size: 14px; line-height: 1.65; margin: 0 0 20px;">
                        ${description}
                      </p>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 28px 0 24px;">
                        <a href="${actionUrl}" target="_blank" style="background: linear-gradient(135deg, #d97706, #ea580c); color: #ffffff !important; padding: 14px 34px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35); border: 1px solid rgba(251, 191, 36, 0.35); letter-spacing: 0.2px;">
                          ${actionText}
                        </a>
                      </div>

                      <!-- Fallback URL -->
                      <div style="border-top: 1px solid #19202E; padding-top: 16px; margin-top: 20px;">
                        <p style="color: #78716c; font-size: 12px; line-height: 1.5; margin: 0 0 4px;">
                          Или скопируйте ссылку в адресную строку браузера:
                        </p>
                        <a href="${actionUrl}" style="color: #f59e0b; font-size: 12px; word-break: break-all; text-decoration: underline; line-height: 1.5;">
                          ${actionUrl}
                        </a>
                      </div>
                    </div>

                    <!-- Security / Expiration Note -->
                    <p style="color: #a8a29e; font-size: 12px; line-height: 1.5; text-align: center; margin: 0 0 20px;">
                      ${footerNote}
                    </p>

                    <!-- Legal Footer -->
                    <div style="border-top: 1px solid #1F2637; padding-top: 18px; font-size: 11px; color: #78716c; text-align: center; line-height: 1.6;">
                      ${legalNote}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/auth/verify?token=${token}`;

  return await sendEmail({
    to: email,
    subject: 'Подтверждение регистрации в CardHub',
    text: `Здравствуйте! Для подтверждения адреса электронной почты в CardHub перейдите по ссылке: ${verifyUrl}`,
    html: renderCardHubEmail({
      title: 'Добро пожаловать в CardHub!',
      subtitle: 'Сервис современных цифровых NFC-визиток',
      description: 'Для завершения регистрации и активации вашего аккаунта подтвердите адрес электронной почты, нажав на кнопку ниже:',
      actionText: 'Подтвердить Email',
      actionUrl: verifyUrl,
      footerNote: 'Ссылка действительна 24 часа. Если вы не регистрировались в CardHub, просто проигнорируйте это письмо.',
      legalNote: 'Соответствует 152-ФЗ и 242-ФЗ • CardHub © 2026',
    }),
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  return await sendEmail({
    to: email,
    subject: 'Сброс пароля в CardHub',
    text: `Здравствуйте! Для сброса пароля в CardHub перейдите по ссылке: ${resetUrl}. Ссылка действительна 30 минут.`,
    html: renderCardHubEmail({
      title: 'Сброс пароля',
      subtitle: 'Запрос на восстановление доступа к CardHub',
      description: 'Вы запросили сброс пароля для вашей учетной записи. Чтобы задать новый пароль, нажмите кнопку ниже:',
      actionText: 'Установить новый пароль',
      actionUrl: resetUrl,
      footerNote: 'Ссылка действительна в течение 30 минут. Если вы не запрашивали сброс пароля, немедленно проверьте безопасность вашей почты.',
      legalNote: 'Соответствует OWASP ASVS L2 • CardHub © 2026',
    }),
  });
}
