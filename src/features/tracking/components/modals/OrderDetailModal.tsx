import { Modal } from '@/shared/components/Modal';
import { User, ReceiptText } from 'lucide-react';
import type { OrderDetail } from '@/features/order/api/transaction.schema';
import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, ORDER_TYPE_LABEL, type OrderStatus } from '../../schema';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetail | undefined;
  isLoading: boolean;
  formatRupiah: (val: number) => string;
  onPrint: () => void;
  onPay: () => void;
  onRequestCancel: () => void;
}

export const OrderDetailModal = ({ isOpen, onClose, order, isLoading, formatRupiah, onPrint, onPay, onRequestCancel }: OrderDetailModalProps) => {
  const status = order?.status;
  // PENDING: bisa dibayar atau dibatalkan. COMPLETED: bisa cetak resi.
  const actions =
    status === 'PENDING'
      ? [
          { label: 'Batalkan Pesanan', onClick: onRequestCancel, variant: 'danger' as const },
          { label: 'Lanjutkan Pembayaran', onClick: onPay, variant: 'primary' as const },
        ]
      : status === 'COMPLETED'
        ? [{ label: 'Cetak Resi', onClick: onPrint, variant: 'primary' as const }]
        : [];
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Order: ${order.orderNo}` : 'Detail Order'}
      size="md"
      actions={actions}
    >
      {isLoading || !order ? (
        <div className="space-y-3 py-6">
          <div className="h-20 bg-[#F8F6F2] rounded-2xl animate-pulse" />
          <div className="h-24 bg-[#F8F6F2] rounded-2xl animate-pulse" />
          <div className="h-28 bg-[#F8F6F2] rounded-2xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2 pb-4 mt-2">

          {/* SECTION 1: Informasi Pemesan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#86673A]" />
                <h4 className="font-black text-xs text-customGray-light uppercase tracking-widest">Informasi Pemesan</h4>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${ORDER_STATUS_STYLE[order.status as OrderStatus] ?? ''}`}>
                {ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status}
              </span>
            </div>
            <div className="bg-[#F8F6F2] p-4 rounded-2xl border border-[#E8DFD1] grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-1">Nama Pelanggan</p>
                <p className="font-black text-sm text-customGray-light">{order.ordererName}</p>
                <p className="text-[10px] font-bold text-content-secondary mt-0.5">{order.ordererPhone || '-'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-1">{ORDER_TYPE_LABEL[order.type] ?? order.type}</p>
                <span className="inline-block bg-[#86673A] text-white px-2 py-1 rounded text-xs font-black uppercase shadow-sm">
                  No. {order.queueNo}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Rincian Pesanan */}
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-divider pb-2">
              <ReceiptText size={16} className="text-[#86673A]" />
              <h4 className="font-black text-xs text-customGray-light uppercase tracking-widest">Rincian Pesanan ({order.items.length} Item)</h4>
            </div>

            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="bg-white border border-divider/60 rounded-xl p-3 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex gap-2.5 items-start">
                      <span className="font-black text-sm text-[#86673A]">{item.quantity}x</span>
                      <div>
                        <h5 className="font-black text-sm text-customGray-light leading-tight">{item.productName}</h5>
                        <p className="text-[10px] font-bold text-content-secondary mt-0.5">Dasar: {formatRupiah(item.basePrice)}</p>
                      </div>
                    </div>
                    <span className="font-black text-sm text-customGray-light">{formatRupiah(item.subtotal)}</span>
                  </div>

                  <div className="pl-[1.6rem] mt-2">
                    {item.selectedOptions.length > 0 && (
                      <div className="space-y-0.5 mb-2">
                        {item.selectedOptions.map(opt => (
                          <div key={opt.id} className="text-[10px] text-content-secondary flex justify-between items-center bg-[#F8F6F2]/50 px-2 py-1 rounded">
                            <span>- {opt.value}</span>
                            {opt.price > 0 && <span className="font-medium text-[#86673A]">+{formatRupiah(opt.price)}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-[10px] italic text-[#86673A] bg-[#86673A]/5 p-2 rounded-lg border border-[#86673A]/10">
                        Catatan: "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Ringkasan Biaya (dari server) */}
          <div className="bg-[#F8F6F2] border-2 border-[#E8DFD1] rounded-2xl p-5 shadow-sm">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[11px] font-bold text-content-secondary"><span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-[11px] font-bold text-semantic-success"><span>Diskon</span><span>- {formatRupiah(order.discountAmount)}</span></div>}
              <div className="flex justify-between text-[11px] font-bold text-content-secondary"><span>Pajak</span><span>{formatRupiah(order.taxAmount)}</span></div>
              <div className="flex justify-between text-[11px] font-bold text-content-secondary"><span>Layanan</span><span>{formatRupiah(order.serviceCharge)}</span></div>
            </div>
            <div className="pt-3 border-t border-dashed border-[#86673A]/30 flex justify-between items-end">
              <span className="block font-bold text-[10px] text-content-secondary uppercase tracking-widest">Total Tagihan</span>
              <span className="text-2xl font-black text-[#86673A] tracking-tight leading-none">{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>

        </div>
      )}
    </Modal>
  );
};
