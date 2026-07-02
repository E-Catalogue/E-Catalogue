import { createFileRoute } from '@tanstack/react-router';
import { SimpleMasterPage } from '@/features/master/SimpleMasterPage';
import { pengecekanApi } from '@/features/master/simpleMaster.api';

export const Route = createFileRoute('/_admin/master/pengecekan')({
  component: () => <SimpleMasterPage api={pengecekanApi} title="Pengecekan" description="Master item pengecekan unit" withCode permCode="PENGECEKAN" />,
});
