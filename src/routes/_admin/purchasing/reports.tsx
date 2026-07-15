import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/purchasing/reports')({
  component: () => (
    <RequirePermission code="purchasing.report.read">
      <ResourceListPage path="/purchasing/reports" />
    </RequirePermission>
  ),
});
