import { createFileRoute } from '@tanstack/react-router';
import { KontakCmsPage } from '@/features/cms/KontakCmsPage';

export const Route = createFileRoute('/_admin/cms/kontak')({
  component: KontakCmsPage,
});
