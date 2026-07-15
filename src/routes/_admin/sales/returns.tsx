import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/sales/returns')({
  component: () => (
    <RequirePermission code="sales.return.read">
      <ResourceListPage path="/sales/returns" />
    </RequirePermission>
  ),
});
