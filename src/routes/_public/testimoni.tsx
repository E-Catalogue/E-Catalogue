import { createFileRoute } from '@tanstack/react-router';
import { TestimoniPublicPage } from '@/features/landing/TestimoniPublicPage';

export const Route = createFileRoute('/_public/testimoni')({
  component: TestimoniPublicPage,
});
