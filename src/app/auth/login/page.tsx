import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Вход в личный кабинет | CardHub',
  description: 'Авторизация в сервисе цифровых визиток CardHub',
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
