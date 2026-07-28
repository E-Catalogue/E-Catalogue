import { createFileRoute } from '@tanstack/react-router';
import { InvestorCapitalPage } from '@/features/investor-suite/InvestorCapitalPage';

export const Route = createFileRoute('/_admin/investor/modal')({
  component: InvestorCapitalPage,
});
