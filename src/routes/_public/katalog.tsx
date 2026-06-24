import { createFileRoute } from '@tanstack/react-router';
import { KatalogPage } from '@/features/landing/KatalogPage';

export const Route = createFileRoute('/_public/katalog')({
  component: KatalogPage,
});
