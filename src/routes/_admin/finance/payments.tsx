import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/finance/payments')({
  component: () => (
    <RequirePermission code="finance.payment.read">
      <ResourceListPage path="/finance/payments" />
    </RequirePermission>
  ),
});
