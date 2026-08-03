import { createFileRoute } from '@tanstack/react-router';
import { ClosingReportPage } from '@/features/reports/ClosingReportPage';
export const Route = createFileRoute('/_admin/laporan-closing')({ component: ClosingReportPage });
