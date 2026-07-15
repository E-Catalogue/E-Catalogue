import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/sales/quotations')({
  component: () => (
    <RequirePermission code="sales.quotation.read">
      <ResourceListPage path="/sales/quotations" />
    </RequirePermission>
  ),
});
