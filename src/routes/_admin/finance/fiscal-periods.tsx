import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/finance/fiscal-periods')({
  component: () => (
    <RequirePermission code="finance.fiscal_period.read">
      <ResourceListPage path="/finance/fiscal-periods" />
    </RequirePermission>
  ),
});
