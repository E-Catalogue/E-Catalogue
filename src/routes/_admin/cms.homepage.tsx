import { createFileRoute } from '@tanstack/react-router';
import { HomepagePage } from '@/features/cms/HomepagePage';

export const Route = createFileRoute('/_admin/cms/homepage')({
  component: HomepagePage,
});
