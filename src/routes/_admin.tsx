import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { MainLayout } from '@/shared/layout/MainLayout';
import { getAccessToken } from '@/core/api/token';

export const Route = createFileRoute('/_admin')({
  beforeLoad: () => {
    if (!getAccessToken()) {
      throw redirect({ to: '/login' });
    }
  },
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
});
