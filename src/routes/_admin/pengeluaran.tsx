import { createFileRoute } from '@tanstack/react-router';
import { RequirePermission } from '@/features/auth/permissions';
import { PengeluaranPage } from '@/features/pengeluaran/PengeluaranPage';

export const Route = createFileRoute('/_admin/pengeluaran')({
  component: () => (
    <RequirePermission code="OPERATIONAL_EXPENSE_READ">
      <PengeluaranPage />
    </RequirePermission>
  ),
});
