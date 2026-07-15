import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/showroom/reservations')({
  component: () => (
    <RequirePermission code="showroom.reservation.read">
      <ResourceListPage path="/showroom/reservations" />
    </RequirePermission>
  ),
});
