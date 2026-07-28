import { createFileRoute } from '@tanstack/react-router';
import { StockReportPage } from '@/features/stock-report/StockReportPage';

export const Route = createFileRoute('/_admin/dashboard-unit')({
  component: StockReportPage,
});
