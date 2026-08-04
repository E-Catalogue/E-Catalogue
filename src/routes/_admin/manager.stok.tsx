import { createFileRoute } from '@tanstack/react-router';
import { ManagerStockPage } from '@/features/manager/ManagerStockPage';

export const Route = createFileRoute('/_admin/manager/stok')({ component: ManagerStockPage });
