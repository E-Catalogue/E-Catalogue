import { createFileRoute } from '@tanstack/react-router';
import { KatalogPage } from '@/features/cms/KatalogPage';

export const Route = createFileRoute('/_admin/cms/katalog')({
  component: KatalogPage,
});
