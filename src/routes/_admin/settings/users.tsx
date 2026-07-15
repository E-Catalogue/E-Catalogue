import { createFileRoute } from '@tanstack/react-router';
import { TenantUserListPage } from '@/features/tenant/pages/TenantUserListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/settings/users')({
  component: () => (
    <RequirePermission code="tenant.user.read">
      <TenantUserListPage />
    </RequirePermission>
  ),
});
