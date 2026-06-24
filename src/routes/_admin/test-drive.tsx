import { createFileRoute } from '@tanstack/react-router';
import { TestDrivePage } from '@/features/test-drive/TestDrivePage';

export const Route = createFileRoute('/_admin/test-drive')({
  component: TestDrivePage,
});
