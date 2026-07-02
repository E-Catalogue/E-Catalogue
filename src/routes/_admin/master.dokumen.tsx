import { createFileRoute } from '@tanstack/react-router';
import { SimpleMasterPage } from '@/features/master/SimpleMasterPage';
import { dokumenApi } from '@/features/master/simpleMaster.api';

export const Route = createFileRoute('/_admin/master/dokumen')({
  component: () => <SimpleMasterPage api={dokumenApi} title="Dokumen" description="Master jenis dokumen" withCode permCode="DOKUMEN" />,
});
