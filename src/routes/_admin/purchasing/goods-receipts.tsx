import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/purchasing/goods-receipts')({
  component: () => (
    <RequirePermission code="purchasing.goods_receipt.read">
      <ResourceListPage path="/purchasing/goods-receipts" />
    </RequirePermission>
  ),
});
