import { createFileRoute } from '@tanstack/react-router';
import { SimpleMasterPage } from '@/features/master/SimpleMasterPage';
import { perlengkapanApi } from '@/features/master/simpleMaster.api';

export const Route = createFileRoute('/_admin/master/perlengkapan')({
  component: () => <SimpleMasterPage api={perlengkapanApi} title="Perlengkapan" description="Master kelengkapan unit" withCode permCode="PERLENGKAPAN" />,
});
