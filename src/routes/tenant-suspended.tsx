import { createFileRoute } from '@tanstack/react-router';
import { TenantSuspendedPage } from '@/features/auth/StatePages';

export const Route = createFileRoute('/tenant-suspended')({
  component: TenantSuspendedPage,
});
