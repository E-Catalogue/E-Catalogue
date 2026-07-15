import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/inventory/movements')({
  component: () => (
    <RequirePermission code="inventory.movement.read">
      <ResourceListPage path="/inventory/movements" />
    </RequirePermission>
  ),
});
