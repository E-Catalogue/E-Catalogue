import { createFileRoute } from '@tanstack/react-router';
import { InvestorObligationPage } from '@/features/investor-obligation/InvestorObligationPage';

export const Route = createFileRoute('/_admin/master/investor-obligation')({
  component: InvestorObligationPage,
});
