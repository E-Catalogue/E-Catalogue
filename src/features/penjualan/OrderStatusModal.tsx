import { useState } from 'react';
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type LeadOrder, type OrderStatus } from '@/features/crm/crm.types';

/**
 * State machine order backend hanya punya 2 transisi valid, keduanya HANYA dari BOOKING
 * (lead-order.service.js `updateStatus()`; README §15 "Order": `BOOKING → DEAL`,
 * `BOOKING → CANCELLED`). Modal ini SENGAJA tidak lagi berupa grid pilihan 10 status
 * funnel lama — hanya dua aksi eksplisit dengan confirmation dialog terpisah
 * (README §19: DEAL & CANCELLED wajib confirmation dialog).
 */
interface Props {
  open: boolean;
  onClose: () => void;
  order: LeadOrder | null;
  submitting?: boolean;
  onSubmit: (status: Extract<OrderStatus, 'DEAL' | 'CANCELLED'>) => void;
}

export const OrderStatusModal = ({ open, onClose, order, submitting, onSubmit }: Props) => {
  const [pending, setPending] = useState<Extract<OrderStatus, 'DEAL' | 'CANCELLED'> | null>(null);
  if (!open && pending) setPending(null);

  const canTransition = order?.status === 'BOOKING';

  return (
    <>
      <Modal
        open={open} onClose={onClose} icon={<RefreshCw size={20} />}
        title="Ubah Status Order"
        subtitle={order?.nomorOrder ? `Order: ${order.nomorOrder}` : undefined}
        footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">Status saat ini</span>
            {order?.status && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${ORDER_STATUS_COLOR[order.status]}`}>
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            )}
          </div>

          {canTransition ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => setPending('DEAL')}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-accent-green/30 bg-accent-green/5 hover:bg-accent-green/10 transition-colors text-left"
              >
                <CheckCircle2 size={18} className="text-accent-green shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-ink">Tandai DEAL</p>
                  <p className="text-[11px] text-muted font-medium">Unit terjual, settlement dibuat otomatis</p>
                </div>
              </button>
              <button
                onClick={() => setPending('CANCELLED')}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-semantic-error/30 bg-semantic-error/5 hover:bg-semantic-error/10 transition-colors text-left"
              >
                <XCircle size={18} className="text-semantic-error shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-ink">Batalkan Order</p>
                  <p className="text-[11px] text-muted font-medium">Unit kembali READY STOCK</p>
                </div>
              </button>
            </div>
          ) : (
            <p className="text-[12px] font-semibold text-muted py-2">
              Order sudah berstatus {order ? ORDER_STATUS_LABEL[order.status] : ''} dan bersifat final — status tidak dapat diubah lagi.
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={pending === 'DEAL'}
        onClose={() => setPending(null)}
        onConfirm={() => onSubmit('DEAL')}
        closeOnConfirm={false}
        loading={submitting}
        tone="primary"
        icon={CheckCircle2}
        title="Tandai Order DEAL"
        message="Tindakan ini tidak dapat dibatalkan. Unit akan ditandai SOLD, lead ditandai WON, dan settlement penjualan dibuat. Pastikan pricing/funding/rekondisi unit sudah siap sebelum melanjutkan."
        confirmLabel="Ya, Tandai DEAL"
      />
      <ConfirmDialog
        open={pending === 'CANCELLED'}
        onClose={() => setPending(null)}
        onConfirm={() => onSubmit('CANCELLED')}
        closeOnConfirm={false}
        loading={submitting}
        tone="danger"
        icon={XCircle}
        title="Batalkan Order"
        message="Order akan dibatalkan dan unit dikembalikan ke status READY STOCK. Tindakan ini tidak dapat dibatalkan langsung. Lanjutkan?"
        confirmLabel="Ya, Batalkan"
      />
    </>
  );
};
