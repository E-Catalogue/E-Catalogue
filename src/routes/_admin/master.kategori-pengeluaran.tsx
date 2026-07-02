import { createFileRoute } from '@tanstack/react-router';
import { SimpleMasterPage } from '@/features/master/SimpleMasterPage';
import { kategoriPengeluaranApi } from '@/features/master/simpleMaster.api';

export const Route = createFileRoute('/_admin/master/kategori-pengeluaran')({
  component: () => <SimpleMasterPage api={kategoriPengeluaranApi} title="Kategori Pengeluaran" description="Master kategori biaya/pengeluaran" withCode permCode="KATEGORI_PENGELUARAN" />,
});
