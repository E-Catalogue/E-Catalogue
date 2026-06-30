import { createFileRoute } from '@tanstack/react-router';
import { TestimoniPage } from '@/features/cms/TestimoniPage';

export const Route = createFileRoute('/_admin/cms/testimoni')({
  component: TestimoniPage,
});
