import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/finance/reports')({
  component: () => (
    <RequirePermission code="finance.report.read">
      <ResourceListPage path="/finance/reports" />
    </RequirePermission>
  ),
});
