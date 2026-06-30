import { createFileRoute } from '@tanstack/react-router';
import { BannerPage } from '@/features/cms/BannerPage';

export const Route = createFileRoute('/_admin/cms/banner')({
  component: BannerPage,
});
