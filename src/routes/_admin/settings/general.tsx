import { createFileRoute } from '@tanstack/react-router';
import { TenantProfilePage } from '@/features/tenant/pages/TenantProfilePage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/settings/general')({
  component: () => (
    <RequirePermission code="tenant.profile.read">
      <TenantProfilePage />
    </RequirePermission>
  ),
});
