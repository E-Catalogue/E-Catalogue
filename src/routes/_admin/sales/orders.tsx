import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/sales/orders')({
  component: () => (
    <RequirePermission code="sales.order.read">
      <ResourceListPage path="/sales/orders" />
    </RequirePermission>
  ),
});
