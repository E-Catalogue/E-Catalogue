import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/settings/modules')({
  component: () => (
    <RequirePermission code="tenant.module_settings.read">
      <ResourceListPage path="/settings/modules" />
    </RequirePermission>
  ),
});
