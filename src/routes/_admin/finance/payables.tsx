import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/finance/payables')({
  component: () => (
    <RequirePermission code="finance.payable.read">
      <ResourceListPage path="/finance/payables" />
    </RequirePermission>
  ),
});
