import { createFileRoute, Outlet } from '@tanstack/react-router';
import { MainLayout } from '@/shared/layout/MainLayout';

export const Route = createFileRoute('/_admin')({
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
});
