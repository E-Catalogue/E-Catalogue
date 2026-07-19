import { createFileRoute } from '@tanstack/react-router';
import { PenjualanPage } from '@/features/penjualan/PenjualanPage';

export const Route = createFileRoute('/_admin/penjualan')({
  component: PenjualanPage,
});
