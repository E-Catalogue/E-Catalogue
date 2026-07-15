import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/sales/invoices')({
  component: () => (
    <RequirePermission code="sales.invoice.read">
      <ResourceListPage path="/sales/invoices" />
    </RequirePermission>
  ),
});
