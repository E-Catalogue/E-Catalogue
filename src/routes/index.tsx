import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginPage } from '@/features/auth/pages/LoginPage';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: '/pos',
      });
    }
  },
  component: LoginPage,
});