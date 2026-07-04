import { createFileRoute } from '@tanstack/react-router';
import { CreditSimPage } from '@/features/cms/CreditSimPage';

export const Route = createFileRoute('/_admin/cms/simulasi')({
  component: CreditSimPage,
});
