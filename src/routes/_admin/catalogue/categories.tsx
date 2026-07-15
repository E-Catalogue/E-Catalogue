import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/catalogue/categories')({
  component: () => (
    <RequirePermission code="catalogue.category.read">
      <ResourceListPage path="/catalogue/categories" />
    </RequirePermission>
  ),
});
