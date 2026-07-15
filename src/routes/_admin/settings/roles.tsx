import { createFileRoute } from '@tanstack/react-router';
import { TenantRoleListPage } from '@/features/tenant/pages/TenantRoleListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/settings/roles')({
  component: () => (
    <RequirePermission code="tenant.role.read">
      <TenantRoleListPage />
    </RequirePermission>
  ),
});
