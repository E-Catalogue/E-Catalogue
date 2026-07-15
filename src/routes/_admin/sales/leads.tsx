import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/sales/leads')({
  component: () => (
    <RequirePermission code="sales.lead.read">
      <ResourceListPage path="/sales/leads" />
    </RequirePermission>
  ),
});
