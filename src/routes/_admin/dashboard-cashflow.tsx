import { createFileRoute } from '@tanstack/react-router';
import { RequirePermission } from '@/features/auth/permissions';
import { DashboardCashflowPage } from '@/features/cashflow/DashboardCashflowPage';

export const Route = createFileRoute('/_admin/dashboard-cashflow')({
  component: () => (
    <RequirePermission code="CASH_TRANSACTION_READ">
      <DashboardCashflowPage />
    </RequirePermission>
  ),
});
