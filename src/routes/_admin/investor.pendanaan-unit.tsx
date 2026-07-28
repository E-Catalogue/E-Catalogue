import { createFileRoute } from '@tanstack/react-router';
import { InvestorFundingListPage } from '@/features/investor-suite/InvestorFundingListPage';

export const Route = createFileRoute('/_admin/investor/pendanaan-unit')({
  component: InvestorFundingListPage,
});
