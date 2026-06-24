import type { CreatedOrder } from '@/features/order/api/transaction.schema';
import { OrderTrackingCard } from './OrderTrackingCard';

interface OrderTrackingListProps {
  orders: CreatedOrder[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOrderClick: (order: CreatedOrder) => void;
  formatRupiah: (val: number) => string;
}

export const OrderTrackingList = ({ orders, isLoading, isError, onRetry, onOrderClick, formatRupiah }: OrderTrackingListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border-2 border-[#E8DFD1] rounded-[1.5rem] p-5 md:p-6 animate-pulse h-[200px]">
            <div className="h-4 bg-[#F8F6F2] rounded w-1/2 mb-3" />
            <div className="h-20 bg-[#F8F6F2] rounded-xl mb-4" />
            <div className="h-5 bg-[#F8F6F2] rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-[#E8DFD1] rounded-[2rem] shadow-sm gap-3">
        <h3 className="text-lg font-black text-customGray-light">Gagal Memuat Pesanan</h3>
        <button onClick={onRetry} className="px-4 py-2 rounded-xl bg-[#86673A] text-white text-xs font-bold shadow-sm">Coba Lagi</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-[#E8DFD1] rounded-[2rem] shadow-sm">
        <div className="w-20 h-20 bg-[#F8F6F2] rounded-full flex items-center justify-center text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-black text-customGray-light mb-1">Tidak Ada Pesanan</h3>
        <p className="text-xs font-medium text-content-secondary">Coba ubah filter status/tipe atau kata kunci pencarian.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {orders.map(order => (
        <OrderTrackingCard
          key={order.id}
          order={order}
          onClick={() => onOrderClick(order)}
          formatRupiah={formatRupiah}
        />
      ))}
    </div>
  );
};
