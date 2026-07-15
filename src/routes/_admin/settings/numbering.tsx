import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/settings/numbering')({
  component: () => (
    <RequirePermission code="tenant.numbering.read">
      <ResourceListPage path="/settings/numbering" />
    </RequirePermission>
  ),
});
