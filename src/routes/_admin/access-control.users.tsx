import { createFileRoute } from '@tanstack/react-router';
import { UserPage } from '@/features/access/UserPage';

export const Route = createFileRoute('/_admin/access-control/users')({
  component: UserPage,
});
