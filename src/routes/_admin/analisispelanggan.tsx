import { createFileRoute } from '@tanstack/react-router';
import { CrmAnalyticsPage } from '@/features/crm-analytics/CrmAnalyticsPage';

export const Route = createFileRoute('/_admin/analisispelanggan')({
  component: CrmAnalyticsPage,
});
