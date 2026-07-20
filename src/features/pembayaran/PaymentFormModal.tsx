import { useState } from 'react';
import { Wallet, Search, ArrowLeft } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { usePermissions } from '@/features/auth/usePermissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { useLeadOrders } from '@/features/crm/crm.hooks';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type LeadOrder } from '@/features/crm/crm.types';
import { PayForm } from '@/features/penjualan/OrderDetailModal';

const idr = (n?: number | null) =>
  n == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Pembayaran di backend SELALU terikat ke `LeadOrder` (`POST /lead-orders/:id/payments`) — tidak
 * ada endpoint "catat pembayaran" berdiri sendiri seperti PRD lama. Quick-input ini karena itu
 * berupa 2 langkah: cari & pilih order dulu, baru muncul form pembayaran nyata (reuse `PayForm`
 * yang sama persis dipakai `OrderDetailModal`, termasuk idempotency-key & posting kas).
 */
export const PaymentFormModal = ({ open, onClose }: Props) => {
  const { can } = usePermissions();
  const { isOwner, selectedBranchId, branchHeader, branchKey } = useBranchScope();
  const mutationBlocked = isOwner && !selectedBranchId;

  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const [picked, setPicked] = useState<LeadOrder | null>(null);

  const { data, isLoading } = useLeadOrders(branchKey, { page: 1, limit: 10, search: debounced || undefined }, branchHeader);
  const orders = (data?.data ?? []).filter((o) => o.status !== 'CANCELLED');

  const reset = () => { setPicked(null); setSearch(''); };
  const handleClose = () => { reset(); onClose(); };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      icon={<Wallet size={20} />}
      title={picked ? `Catat Pembayaran — ${picked.nomorOrder ?? picked.id}` : 'Catat Pembayaran'}
      subtitle={picked ? undefined : 'Cari order terlebih dahulu — pembayaran selalu tercatat pada order tertentu'}
      size="lg"
      footer={picked ? undefined : <Button variant="secondary" onClick={handleClose}>Tutup</Button>}
    >
      {!picked ? (
        <div className="space-y-3">
          {isOwner && !selectedBranchId && (
            <p className="text-[12px] font-semibold text-accent-amber">Menampilkan order dari semua cabang — pilih cabang di halaman Pembayaran untuk mencatat pembayaran.</p>
          )}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. order / nama customer..."
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-surface-soft border border-border text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-divider border border-border rounded-2xl">
            {isLoading ? (
              <p className="text-center py-8 text-[12px] text-muted">Memuat order...</p>
            ) : orders.length === 0 ? (
              <p className="text-center py-8 text-[12px] text-muted">{debounced ? 'Tidak ada order yang cocok.' : 'Belum ada order.'}</p>
            ) : (
              orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setPicked(o)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-soft transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-ink text-[13px] truncate">{o.nomorOrder ?? o.id} · {o.lead?.nama ?? '-'}</p>
                    <p className="text-[11px] text-muted mt-0.5">{o.unit ? [o.unit.merek?.name, o.unit.tipe?.name].filter(Boolean).join(' ') : '-'} · Sisa {idr(o.remainingPayment)}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg ${ORDER_STATUS_COLOR[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setPicked(null)} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-muted hover:text-primary">
            <ArrowLeft size={14} /> Ganti Order
          </button>
          <div className="p-3.5 rounded-2xl bg-surface-soft border border-border">
            <p className="font-bold text-ink text-[13px]">{picked.lead?.nama ?? '-'}</p>
            <p className="text-[11px] text-muted mt-0.5">{picked.unit ? [picked.unit.merek?.name, picked.unit.tipe?.name].filter(Boolean).join(' ') : '-'} · Sisa Tagihan {idr(picked.remainingPayment)}</p>
          </div>
          {can('LEAD_PAYMENT_CREATE') ? (
            <PayForm
              orderId={picked.id}
              branchKey={branchKey}
              headers={branchHeader}
              disabled={mutationBlocked}
              disabledReason={mutationBlocked ? 'Pilih cabang konkret terlebih dahulu untuk mencatat pembayaran.' : undefined}
            />
          ) : (
            <p className="text-center py-6 text-[12px] text-muted">Anda tidak memiliki izin mencatat pembayaran.</p>
          )}
        </div>
      )}
    </Modal>
  );
};
