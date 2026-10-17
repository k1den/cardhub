import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.string().email('Введите корректный адрес электронной почты').max(255));

export const passwordSchema = z
  .string()
  .min(10, 'Пароль должен содержать не менее 10 символов')
  .max(128, 'Пароль не должен превышать 128 символов')
  .regex(/[A-ZА-ЯЁ]/, 'Пароль должен содержать хотя бы одну заглавную букву')
  .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  // 152-ФЗ compliance: Separate, un-prechecked consents
  consentPdProcessing: z.literal(true, {
    message: 'Необходимо дать согласие на обработку персональных данных',
  }),
  consentOffer: z.literal(true, {
    message: 'Необходимо принять условия публичной оферты',
  }),
  consentMarketing: z.boolean().default(false),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль'),
  totpCode: z.string().length(6, 'Код 2FA должен состоять из 6 цифр').optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Токен сброса пароля обязателен'),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
