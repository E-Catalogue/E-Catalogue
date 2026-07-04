import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PublicLayout } from '@/features/landing/PublicLayout';
import { CustomerNotFound, CustomerServerError } from '@/features/landing/CustomerStates';

export const Route = createFileRoute('/_public')({
  component: () => (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  ),
  // 404 ramah pelanggan (di dalam layout publik)
  notFoundComponent: () => (
    <PublicLayout>
      <CustomerNotFound />
    </PublicLayout>
  ),
  // Gangguan render tak terduga → tampilkan error server (di dalam layout)
  errorComponent: ({ reset }) => (
    <PublicLayout>
      <CustomerServerError onRetry={reset} />
    </PublicLayout>
  ),
});
