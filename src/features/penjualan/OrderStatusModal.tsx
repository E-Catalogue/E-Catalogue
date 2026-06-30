import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type LeadOrder, type OrderStatus } from '@/features/crm/crm.types';

const STATUS_FLOW: OrderStatus[] = [
  'NEW', 'INTERESTED', 'FOLLOW_UP', 'TEST_DRIVE',
  'APPROVED_KREDIT', 'CASH_BUYER', 'BOOKING', 'DEAL',
  'REJECT_SLIK', 'CANCEL',
];

interface Props {
  open: boolean;
  onClose: () => void;
  order: LeadOrder | null;
  submitting?: boolean;
  onSubmit: (status: OrderStatus) => void;
}

export const OrderStatusModal = ({ open, onClose, order, submitting, onSubmit }: Props) => {
  const [selected, setSelected] = useState<OrderStatus | null>(null);
  if (open && !selected && order?.status) setSelected(order.status);
  if (!open && selected) setSelected(null);

  return (
    <Modal
      open={open} onClose={onClose} icon={<RefreshCw size={20} />}
      title="Ubah Status Order"
      subtitle={order?.nomorOrder ? `Order: ${order.nomorOrder}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button
            disabled={!selected || selected === order?.status || submitting}
            onClick={() => selected && onSubmit(selected)}
          >
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {STATUS_FLOW.map((s) => {
          const isCurrent = s === order?.status;
          const isSelected = s === selected;
          return (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface-soft hover:border-border-hover'
              }`}
            >
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${ORDER_STATUS_COLOR[s]}`}>
                {ORDER_STATUS_LABEL[s]}
              </span>
              {isCurrent && (
                <span className="ml-auto text-[10px] font-bold text-primary uppercase tracking-wide">Saat ini</span>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
