import { createFileRoute } from '@tanstack/react-router';
import { PublicNavMenuPage } from '@/features/cms/PublicNavMenuPage';

export const Route = createFileRoute('/_admin/cms/menu-navigasi')({
  component: PublicNavMenuPage,
});
