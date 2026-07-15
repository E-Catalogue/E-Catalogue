import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/inventory/transfers')({
  component: () => (
    <RequirePermission code="inventory.transfer.read">
      <ResourceListPage path="/inventory/transfers" />
    </RequirePermission>
  ),
});
