import { createFileRoute } from '@tanstack/react-router';
import { InvestorFundingReportPage } from '@/features/investor-funding/InvestorFundingReportPage';

export const Route = createFileRoute('/_admin/master/investor-funding-usage')({
  component: InvestorFundingReportPage,
});
