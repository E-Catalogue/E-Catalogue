import { createFileRoute } from '@tanstack/react-router';
import { SiteSettingsPage } from '@/features/cms/SiteSettingsPage';

export const Route = createFileRoute('/_admin/cms/site-settings')({
  component: SiteSettingsPage,
});
