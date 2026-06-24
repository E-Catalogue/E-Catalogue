import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PublicLayout } from '@/features/landing/PublicLayout';

export const Route = createFileRoute('/_public')({
  component: () => (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  ),
});
