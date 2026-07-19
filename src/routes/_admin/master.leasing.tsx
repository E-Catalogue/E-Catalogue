import { createFileRoute } from '@tanstack/react-router';
import { SimpleMasterPage } from '@/features/master/SimpleMasterPage';
import { leasingApi } from '@/features/master/simpleMaster.api';

export const Route = createFileRoute('/_admin/master/leasing')({
  component: () => <SimpleMasterPage api={leasingApi} title="Leasing" description="Master perusahaan leasing/pembiayaan" withCode permCode="LEASING" />,
});
