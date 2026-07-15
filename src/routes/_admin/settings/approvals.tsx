import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/settings/approvals')({
  component: () => (
    <RequirePermission code="tenant.approval.read">
      <ResourceListPage path="/settings/approvals" />
    </RequirePermission>
  ),
});
