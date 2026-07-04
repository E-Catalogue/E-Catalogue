import { createRootRoute, Outlet } from '@tanstack/react-router';
import { PublicLayout } from '@/features/landing/PublicLayout';
import { CustomerNotFound } from '@/features/landing/CustomerStates';

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <PublicLayout>
      <CustomerNotFound />
    </PublicLayout>
  ),
});
