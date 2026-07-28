import { createFileRoute } from '@tanstack/react-router';
import { InvestorPaymentLedgerPage } from '@/features/investor-suite/InvestorPaymentLedgerPage';

export const Route = createFileRoute('/_admin/investor/pembayaran')({
  component: InvestorPaymentLedgerPage,
});
