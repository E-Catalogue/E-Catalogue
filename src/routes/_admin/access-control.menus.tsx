import { createFileRoute } from '@tanstack/react-router';
import { MenuPage } from '@/features/access/MenuPage';

export const Route = createFileRoute('/_admin/access-control/menus')({
  component: MenuPage,
});
