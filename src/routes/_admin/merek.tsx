import { createFileRoute } from '@tanstack/react-router';
import { MerekPage } from '@/features/master/MerekPage';

export const Route = createFileRoute('/_admin/merek')({
  component: MerekPage,
});
