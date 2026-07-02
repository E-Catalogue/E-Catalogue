import { createFileRoute } from '@tanstack/react-router';
import { KontakCmsPage } from '@/features/cms/KontakCmsPage'; // This is actually SiteSettings currently

export const Route = createFileRoute('/_admin/cms/site-setting')({
  component: KontakCmsPage,
});
