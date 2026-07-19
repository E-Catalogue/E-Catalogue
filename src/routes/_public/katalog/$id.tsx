import { createFileRoute } from '@tanstack/react-router';
import { KatalogDetailPage } from '@/features/landing/KatalogDetailPage';

export const Route = createFileRoute('/_public/katalog/$id')({
  component: KatalogDetailPage,
});
