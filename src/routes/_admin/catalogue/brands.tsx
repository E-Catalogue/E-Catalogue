import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/catalogue/brands')({
  component: () => (
    <RequirePermission code="catalogue.brand.read">
      <ResourceListPage path="/catalogue/brands" />
    </RequirePermission>
  ),
});
