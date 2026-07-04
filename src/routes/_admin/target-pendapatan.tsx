import { createFileRoute } from '@tanstack/react-router';
import { RequirePermission } from '@/features/auth/permissions';
import { TargetPendapatanPage } from '@/features/target-penjualan/TargetPendapatanPage';

export const Route = createFileRoute('/_admin/target-pendapatan')({
  component: () => (
    <RequirePermission any={['REVENUE_TARGET_READ', 'SALES_TARGET_READ', 'REVENUE_TARGET', 'SALES_TARGET', 'PENJUALAN_READ', 'DASHBOARD_READ']}>
      <TargetPendapatanPage />
    </RequirePermission>
  ),
});
