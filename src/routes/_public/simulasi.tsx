import { createFileRoute } from '@tanstack/react-router';
import { SimulasiPage } from '@/features/landing/SimulasiPage';

export const Route = createFileRoute('/_public/simulasi')({
  component: SimulasiPage,
});
