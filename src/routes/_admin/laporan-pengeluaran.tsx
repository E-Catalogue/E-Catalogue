import { createFileRoute } from '@tanstack/react-router';
import { ExpenseReportPage } from '@/features/reports/ExpenseReportPage';
export const Route = createFileRoute('/_admin/laporan-pengeluaran')({ component: ExpenseReportPage });
