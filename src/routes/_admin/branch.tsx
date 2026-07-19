import { createFileRoute } from '@tanstack/react-router';
import { BranchPage } from '@/features/master/BranchPage';

export const Route = createFileRoute('/_admin/branch')({
  component: BranchPage,
});
