import { createFileRoute } from '@tanstack/react-router';
import { InvestorPage } from '@/features/master/InvestorPage';

export const Route = createFileRoute('/_admin/master/investor')({
  component: InvestorPage,
});
