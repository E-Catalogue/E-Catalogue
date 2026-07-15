import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/showroom/deliveries')({
  component: () => (
    <RequirePermission code="showroom.delivery.read">
      <ResourceListPage path="/showroom/deliveries" />
    </RequirePermission>
  ),
});
