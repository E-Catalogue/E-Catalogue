import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/showroom/test-drives')({
  component: () => (
    <RequirePermission code="showroom.test_drive.read">
      <ResourceListPage path="/showroom/test-drives" />
    </RequirePermission>
  ),
});
