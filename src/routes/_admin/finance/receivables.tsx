import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/finance/receivables')({
  component: () => (
    <RequirePermission code="finance.receivable.read">
      <ResourceListPage path="/finance/receivables" />
    </RequirePermission>
  ),
});
