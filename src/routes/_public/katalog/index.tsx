import { createFileRoute } from '@tanstack/react-router';
import { KatalogPage } from '@/features/landing/KatalogPage';

export const Route = createFileRoute('/_public/katalog/')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({ q: typeof search.q === 'string' && search.q ? search.q : undefined }),
  component: KatalogPage,
});
