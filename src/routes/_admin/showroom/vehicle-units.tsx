import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/showroom/vehicle-units')({
  component: () => (
    <RequirePermission code="showroom.vehicle_unit.read">
      <ResourceListPage path="/showroom/vehicle-units" />
    </RequirePermission>
  ),
});
