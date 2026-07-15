import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/catalogue/price-lists')({
  component: () => (
    <RequirePermission code="catalogue.price_list.read">
      <ResourceListPage path="/catalogue/price-lists" />
    </RequirePermission>
  ),
});
