'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '../../../features/auth/AuthLayout';
import { RegisterForm } from '../../../features/auth/RegisterForm';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  return (
    <AuthLayout mode="register">
      <RegisterForm
        onSwitchToLogin={() =>
          router.push(
            `/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
          )
        }
        onSubmitSuccess={() => router.push(redirectUrl)}
      />
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}

