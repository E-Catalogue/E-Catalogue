import { createFileRoute } from '@tanstack/react-router';
import { SimpleMasterPage } from '@/features/master/SimpleMasterPage';
import { sumberLeadApi } from '@/features/master/simpleMaster.api';

export const Route = createFileRoute('/_admin/master/sumber-lead')({
  component: () => <SimpleMasterPage api={sumberLeadApi} title="Sumber Lead" description="Master asal/sumber prospek" withCode permCode="SUMBER_LEAD" />,
});
