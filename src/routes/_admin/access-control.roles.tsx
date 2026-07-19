import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/features/access/RolePage';

export const Route = createFileRoute('/_admin/access-control/roles')({
  component: RolePage,
});
