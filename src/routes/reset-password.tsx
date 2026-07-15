import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordPage } from '@/features/auth/PasswordPages';

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
});
