import { createFileRoute } from '@tanstack/react-router';
import { PembayaranPage } from '@/features/pembayaran/PembayaranPage';

export const Route = createFileRoute('/_admin/pembayaran')({
  component: PembayaranPage,
});
