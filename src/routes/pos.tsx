import { createFileRoute, redirect } from '@tanstack/react-router';
import { PointOfSalePage } from '@/features/order/pages/PointOfSalePage';

export const Route = createFileRoute('/pos')({
  // Mendukung ?orderId=... untuk membuka langsung bagian pembayaran order yang sudah ada (dari tracking)
  validateSearch: (search: Record<string, unknown>): { orderId?: string } => ({
    orderId: typeof search.orderId === 'string' ? search.orderId : undefined,
  }),
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: '/',
      });
    }
  },
  component: PointOfSalePage,
});