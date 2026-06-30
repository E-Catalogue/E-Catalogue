import { createFileRoute } from '@tanstack/react-router';
import { RequirePermission } from '@/features/auth/permissions';
import { CashFlowPage } from '@/features/cashflow/CashFlowPage';

export const Route = createFileRoute('/_admin/cashflow')({
  component: () => (
    <RequirePermission code="CASH_TRANSACTION_READ">
      <CashFlowPage />
    </RequirePermission>
  ),
});
