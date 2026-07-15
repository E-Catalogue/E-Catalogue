import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/showroom/leasing')({
  component: () => (
    <RequirePermission code="showroom.leasing.read">
      <ResourceListPage path="/showroom/leasing" />
    </RequirePermission>
  ),
});
