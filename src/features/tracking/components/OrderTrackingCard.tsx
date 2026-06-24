import { Clock, CreditCard, ChefHat, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import type { CreatedOrder } from '@/features/order/api/transaction.schema';
import { ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, type OrderStatus } from '../schema';

interface OrderTrackingCardProps {
  order: CreatedOrder;
  onClick: () => void;
  formatRupiah: (val: number) => string;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

// Stepper mengikuti lifecycle status order (CANCELLED ditangani terpisah).
const STEPS = [
  { id: 'PENDING', label: 'Pending', icon: Clock },
  { id: 'PAID', label: 'Dibayar', icon: CreditCard },
  { id: 'PROCESSING', label: 'Diproses', icon: ChefHat },
  { id: 'COMPLETED', label: 'Selesai', icon: CheckCircle2 },
];

// Index tahap stepper per status
const STATUS_STEP: Record<OrderStatus, number> = {
  PENDING: 0, PAID: 1, PROCESSING: 2, COMPLETED: 3, CANCELLED: -1,
};

const STATUS_COLOR: Record<OrderStatus, { text: string; bg: string; border: string; ring: string }> = {
  PENDING: { text: 'text-semantic-warning', bg: 'bg-semantic-warning', border: 'border-semantic-warning', ring: 'ring-semantic-warning/20' },
  PAID: { text: 'text-semantic-info', bg: 'bg-semantic-info', border: 'border-semantic-info', ring: 'ring-semantic-info/20' },
  PROCESSING: { text: 'text-[#86673A]', bg: 'bg-[#86673A]', border: 'border-[#86673A]', ring: 'ring-[#86673A]/20' },
  COMPLETED: { text: 'text-semantic-success', bg: 'bg-semantic-success', border: 'border-semantic-success', ring: 'ring-semantic-success/20' },
  CANCELLED: { text: 'text-semantic-error', bg: 'bg-semantic-error', border: 'border-semantic-error', ring: 'ring-semantic-error/20' },
};

export const OrderTrackingCard = ({ order, onClick, formatRupiah }: OrderTrackingCardProps) => {
  const status = order.status as OrderStatus;
  const isPending = status === 'PENDING';
  const colors = STATUS_COLOR[status] ?? STATUS_COLOR.PENDING;
  const activeIndex = STATUS_STEP[status] ?? 0;

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-[#E8DFD1] rounded-[1.5rem] p-5 md:p-6 cursor-pointer hover:border-[#86673A] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden min-h-[260px] md:min-h-[280px]"
    >
      <div className={`absolute top-0 left-0 w-full h-1.5 ${order.type === 'DINE_IN' ? 'bg-[#86673A]' : 'bg-customGray-light'}`}></div>

      <div className="flex justify-between items-start mb-4 pt-1">
        <div>
          <span className="font-black text-sm md:text-base text-customGray-light block mb-1">{order.orderNo}</span>
          <span className="font-bold text-[10px] md:text-[11px] text-content-secondary bg-[#F8F6F2] px-2.5 py-1 rounded-md border border-[#E8DFD1]">{formatTime(order.createdAt)}</span>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider border ${colors.text} ${colors.border} bg-white`}>
          {ORDER_STATUS_LABEL[status] ?? order.status}
        </span>
      </div>

      <div className="bg-[#F8F6F2] rounded-xl p-4 mb-6 border border-[#E8DFD1]">
        <div className="flex justify-between items-center mb-2.5">
          <h4 className="font-black text-sm md:text-base text-customGray-light truncate pr-2">{order.ordererName}</h4>
          <span className="text-[10px] md:text-[11px] font-bold text-content-secondary uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-[#E8DFD1]">No. {order.queueNo}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider shadow-sm ${order.type === 'DINE_IN' ? 'bg-[#86673A] text-white' : 'bg-customGray-light text-white'}`}>
            {ORDER_TYPE_LABEL[order.type] ?? order.type}
          </span>
          {order.ordererPhone && <span className="font-bold text-[10px] md:text-xs text-customGray-light">• {order.ordererPhone}</span>}
        </div>
      </div>

      {/* STEPPER STATUS ORDER */}
      {status === 'CANCELLED' ? (
        <div className="mt-auto mb-6 bg-semantic-error/10 text-semantic-error border border-semantic-error/20 rounded-xl p-3 flex items-center justify-center gap-2">
          <XCircle size={18} strokeWidth={3} />
          <span className="text-[11px] font-black uppercase tracking-widest">Pesanan Dibatalkan</span>
        </div>
      ) : (
        <div className="mt-auto mb-6 px-1">
          <div className="flex items-center w-full relative">
            {STEPS.map((step, idx) => {
              const isActive = idx <= activeIndex;
              const isCurrent = idx === activeIndex;
              const Icon = step.icon;
              const isLast = idx === STEPS.length - 1;
              return (
                <div key={step.id} className={`flex items-center ${!isLast ? 'flex-1' : ''}`}>
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500
                      ${isActive ? `${colors.bg} ${colors.border} text-white shadow-md` : 'bg-white border-[#E8DFD1] text-[#D1C8B8]'}
                      ${isCurrent ? `ring-4 ${colors.ring} scale-110` : ''}`}>
                      <Icon size={16} strokeWidth={isActive ? 3 : 2.5} />
                    </div>
                    <span className={`absolute top-10 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap
                      ${isCurrent ? colors.text : isActive ? 'text-customGray-light' : 'text-content-secondary/50'}`}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className="flex-1 mx-2 relative flex items-center h-full">
                      <div className="h-[3px] bg-[#E8DFD1] rounded-full w-full overflow-hidden absolute top-1/2 -translate-y-1/2">
                        <div className={`absolute top-0 left-0 h-full ${colors.bg} transition-all duration-700 ease-in-out`} style={{ width: activeIndex > idx ? '100%' : '0%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-4 border-t-2 border-dashed border-divider flex justify-between items-end mt-5">
        <div>
          <span className="block text-[10px] md:text-[11px] font-bold text-content-secondary uppercase tracking-widest mb-0.5">Total</span>
          <span className="font-black text-base md:text-lg text-customGray-light leading-none">{formatRupiah(order.totalAmount)}</span>
        </div>
        {isPending ? (
          <span className="flex items-center gap-1.5 bg-semantic-warning/10 text-semantic-warning px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider group-hover:bg-semantic-warning group-hover:text-white transition-colors">
            <CreditCard size={14} strokeWidth={3} /> Bayar
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-content-secondary group-hover:text-[#86673A] transition-colors">
            Detail <ChevronRight size={14} strokeWidth={3} />
          </span>
        )}
      </div>
    </div>
  );
};
