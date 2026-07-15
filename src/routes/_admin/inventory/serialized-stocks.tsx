import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/inventory/serialized-stocks')({
  component: () => (
    <RequirePermission code="inventory.serialized_stock.read">
      <ResourceListPage path="/inventory/serialized-stocks" />
    </RequirePermission>
  ),
});
