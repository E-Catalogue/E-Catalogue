import { createFileRoute } from '@tanstack/react-router';
import { ForgotPasswordPage } from '@/features/auth/PasswordPages';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});
