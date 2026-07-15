import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/finance/journals')({
  component: () => (
    <RequirePermission code="finance.journal.read">
      <ResourceListPage path="/finance/journals" />
    </RequirePermission>
  ),
});
