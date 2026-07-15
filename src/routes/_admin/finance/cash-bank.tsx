import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/finance/cash-bank')({
  component: () => (
    <RequirePermission code="finance.cash_bank.read">
      <ResourceListPage path="/finance/cash-bank" />
    </RequirePermission>
  ),
});
