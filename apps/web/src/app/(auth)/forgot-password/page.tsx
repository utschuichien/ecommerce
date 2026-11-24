'use client';

import React, { Suspense } from 'react';
import { AuthLayout } from '../../../features/auth/AuthLayout';
import { ForgotPasswordFlow } from '../../../features/auth/ForgotPasswordFlow';

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <AuthLayout mode="forgot-password">
        <ForgotPasswordFlow />
      </AuthLayout>
    </Suspense>
  );
}

