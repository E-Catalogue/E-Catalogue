import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/customers')({
  component: () => (
    <RequirePermission code="customer.customer.read">
      <ResourceListPage path="/customers" />
    </RequirePermission>
  ),
});
