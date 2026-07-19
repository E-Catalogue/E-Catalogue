import { createFileRoute } from '@tanstack/react-router';
import { RequirePermission } from '@/features/auth/permissions';
import { PayrollPage } from '@/features/payroll/PayrollPage';

export const Route = createFileRoute('/_admin/payroll')({
  component: () => (
    <RequirePermission code="PAYROLL_READ">
      <PayrollPage />
    </RequirePermission>
  ),
});
