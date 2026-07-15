import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/purchasing/purchase-orders')({
  component: () => (
    <RequirePermission code="purchasing.purchase_order.read">
      <ResourceListPage path="/purchasing/purchase-orders" />
    </RequirePermission>
  ),
});
