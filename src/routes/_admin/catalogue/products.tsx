import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/catalogue/products')({
  component: () => (
    <RequirePermission code="catalogue.product.read">
      <ResourceListPage path="/catalogue/products" />
    </RequirePermission>
  ),
});
