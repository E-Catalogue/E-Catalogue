import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/purchasing/suppliers')({
  component: () => (
    <RequirePermission code="purchasing.supplier.read">
      <ResourceListPage path="/purchasing/suppliers" />
    </RequirePermission>
  ),
});
