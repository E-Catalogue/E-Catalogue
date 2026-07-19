import { createFileRoute } from '@tanstack/react-router';
import { RequirePermission } from '@/features/auth/permissions';
import { TargetPenjualanPage } from '@/features/target-penjualan/TargetPenjualanPage';

export const Route = createFileRoute('/_admin/target-penjualan')({
  component: () => (
    <RequirePermission any={['SALES_TARGET_READ', 'PENJUALAN_READ', 'SALES_TARGET', 'DASHBOARD_READ']}>
      <TargetPenjualanPage />
    </RequirePermission>
  ),
});
