import { createFileRoute } from '@tanstack/react-router';
import { CreditSimCmsPage } from '@/features/cms/CreditSimCmsPage';

export const Route = createFileRoute('/_admin/cms/credit-sim')({
  component: CreditSimCmsPage,
});
