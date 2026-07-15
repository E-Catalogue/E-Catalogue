import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/finance/accounts')({
  component: () => (
    <RequirePermission code="finance.account.read">
      <ResourceListPage path="/finance/accounts" />
    </RequirePermission>
  ),
});
