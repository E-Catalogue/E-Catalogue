import { createFileRoute } from '@tanstack/react-router';
import { KontakPage } from '@/features/landing/KontakPage';

export const Route = createFileRoute('/_public/kontak')({
  component: KontakPage,
});
