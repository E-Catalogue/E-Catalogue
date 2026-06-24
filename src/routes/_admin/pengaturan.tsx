import { createFileRoute } from '@tanstack/react-router';
import { PengaturanPage } from '@/features/pengaturan/PengaturanPage';

export const Route = createFileRoute('/_admin/pengaturan')({
  component: PengaturanPage,
});
