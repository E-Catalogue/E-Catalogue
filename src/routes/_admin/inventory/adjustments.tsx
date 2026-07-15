import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/inventory/adjustments')({
  component: () => (
    <RequirePermission code="inventory.adjustment.read">
      <ResourceListPage path="/inventory/adjustments" />
    </RequirePermission>
  ),
});
