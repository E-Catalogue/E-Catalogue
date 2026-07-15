import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/inventory/stocks')({
  component: () => (
    <RequirePermission code="inventory.stock.read">
      <ResourceListPage path="/inventory/stocks" />
    </RequirePermission>
  ),
});
