import { createFileRoute } from '@tanstack/react-router';
import { LaporanPage } from '@/features/laporan/LaporanPage';

export const Route = createFileRoute('/_admin/laporan')({
  component: LaporanPage,
});
