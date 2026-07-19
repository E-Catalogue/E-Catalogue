import { createFileRoute } from '@tanstack/react-router';
import { RequirePermission } from '@/features/auth/permissions';
import { LaporanCashflowPage } from '@/features/laporan-cashflow/LaporanCashflowPage';

export const Route = createFileRoute('/_admin/laporan-cashflow')({
  component: () => (
    <RequirePermission any={['LAPORAN_CASHFLOW_READ', 'CASHFLOW_REPORT_READ', 'LAPORAN_READ']}>
      <LaporanCashflowPage />
    </RequirePermission>
  ),
});
