import { createFileRoute } from '@tanstack/react-router';
import { ChangePasswordPage } from '@/features/auth/PasswordPages';

export const Route = createFileRoute('/change-password')({
  component: ChangePasswordPage,
});
