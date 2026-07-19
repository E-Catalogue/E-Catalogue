import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { MainLayout } from '@/shared/layout/MainLayout';
import { getAccessToken } from '@/core/api/token';

export const Route = createFileRoute('/_admin')({
  beforeLoad: () => {
    // Hanya user terautentikasi yang boleh masuk area admin.
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
