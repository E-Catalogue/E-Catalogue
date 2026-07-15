import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/sales/reports')({
  component: () => (
    <RequirePermission code="sales.report.read">
      <ResourceListPage path="/sales/reports" />
    </RequirePermission>
  ),
});
