import { createFileRoute } from '@tanstack/react-router';
import { RequirePermission } from '@/features/auth/permissions';
import { TestDrivePage } from '@/features/test-drive/TestDrivePage';

export const Route = createFileRoute('/_admin/test-drive')({
  component: () => (
    <RequirePermission code="TEST_DRIVE_READ">
      <TestDrivePage />
    </RequirePermission>
  ),
});
