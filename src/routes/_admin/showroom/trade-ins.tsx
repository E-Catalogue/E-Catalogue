import { createFileRoute } from '@tanstack/react-router';
import { ResourceListPage } from '@/features/modules/ResourceListPage';
import { RequirePermission } from '@/features/auth/permissions';

export const Route = createFileRoute('/_admin/showroom/trade-ins')({
  component: () => (
    <RequirePermission code="showroom.trade_in.read">
      <ResourceListPage path="/showroom/trade-ins" />
    </RequirePermission>
  ),
});
