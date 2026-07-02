import { createFileRoute } from '@tanstack/react-router';
import { SimpleMasterPage } from '@/features/master/SimpleMasterPage';
import { metodePembayaranApi } from '@/features/master/simpleMaster.api';

export const Route = createFileRoute('/_admin/master/metode-pembayaran')({
  component: () => <SimpleMasterPage api={metodePembayaranApi} title="Metode Pembayaran" description="Master metode pembayaran" withCode permCode="METODE_PEMBAYARAN" />,
});
