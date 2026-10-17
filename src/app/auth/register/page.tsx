import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Регистрация аккаунта | CardHub',
  description: 'Создание учетной записи в сервисе цифровых визиток CardHub',
};

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return <RegisterForm />;
}
