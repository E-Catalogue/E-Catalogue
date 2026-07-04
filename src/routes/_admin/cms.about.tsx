import { createFileRoute } from '@tanstack/react-router';
import { AboutPage } from '@/features/cms/AboutPage';

export const Route = createFileRoute('/_admin/cms/about')({
  component: AboutPage,
});
