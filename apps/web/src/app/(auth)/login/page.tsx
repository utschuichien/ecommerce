'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '../../../features/auth/AuthLayout';
import { LoginForm } from '../../../features/auth/LoginForm';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  return (
    <AuthLayout mode="login">
      <LoginForm
        onSwitchToRegister={() =>
          router.push(
            `/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
          )
        }
        onSubmitSuccess={() => router.push(redirectUrl)}
      />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

