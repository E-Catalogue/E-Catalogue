import { createFileRoute } from '@tanstack/react-router';
import { RekondisiPage } from '@/features/rekondisi/RekondisiPage';

export const Route = createFileRoute('/_admin/rekondisi')({
  component: RekondisiPage,
});
