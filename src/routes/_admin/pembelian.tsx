import { createFileRoute } from '@tanstack/react-router';
import { PembelianPage } from '@/features/pembelian/PembelianPage';

export const Route = createFileRoute('/_admin/pembelian')({
  component: PembelianPage,
});
