import { createFileRoute } from '@tanstack/react-router';
import { TentangPage } from '@/features/landing/TentangPage';

export const Route = createFileRoute('/_public/tentang')({
  component: TentangPage,
});
