import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/inventory/reports')({
  component: () => (
    <RequirePermission code="inventory.report.read">
      <ResourceListPage path="/inventory/reports" />
    </RequirePermission>
  ),
});
