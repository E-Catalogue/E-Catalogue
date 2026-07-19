import { createFileRoute } from '@tanstack/react-router';
import { ReadyStockPage } from '@/features/ready-stock/ReadyStockPage';

export const Route = createFileRoute('/_admin/ready-stock')({
  component: ReadyStockPage,
});
