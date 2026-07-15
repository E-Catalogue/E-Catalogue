import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/inventory/locations')({
  component: () => (
    <RequirePermission code="inventory.location.read">
      <ResourceListPage path="/inventory/locations" />
    </RequirePermission>
  ),
});
