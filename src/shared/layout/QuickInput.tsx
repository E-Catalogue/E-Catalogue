import { useState } from 'react';
import { Plus, Car, Users, KeyRound, ReceiptText, Wallet, type LucideIcon } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { UnitFormModal } from '@/features/units/UnitFormModal';
import { LeadFormModal } from '@/features/crm/LeadFormModal';
import { TestDriveFormModal } from '@/features/test-drive/TestDriveFormModal';
import { SaleFormModal } from '@/features/penjualan/SaleFormModal';
import { PaymentFormModal } from '@/features/pembayaran/PaymentFormModal';
import { useLeadMutations } from '@/features/crm/crm.hooks';
import { notifyApiError } from '@/core/api/notify';
import type { Lead } from '@/features/crm/crm.types';

type Action = 'unit' | 'lead' | 'testdrive' | 'sale' | 'payment';

const ACTIONS: { key: Action; label: string; desc: string; icon: LucideIcon; color: string }[] = [
  { key: 'unit', label: 'Tambah Unit', desc: 'Input stok mobil baru', icon: Car, color: 'bg-primary' },
  { key: 'lead', label: 'Tambah Lead', desc: 'Catat prospek pelanggan', icon: Users, color: 'bg-accent-blue' },
  { key: 'testdrive', label: 'Jadwal Test Drive', desc: 'Buat jadwal test drive', icon: KeyRound, color: 'bg-accent-orange' },
  { key: 'sale', label: 'Buat Penjualan', desc: 'Transaksi penjualan unit', icon: ReceiptText, color: 'bg-accent-green' },
  { key: 'payment', label: 'Catat Pembayaran', desc: 'Pembayaran / cicilan', icon: Wallet, color: 'bg-accent-purple' },
];

interface QuickInputProps {
  expanded: boolean;
}

export const QuickInput = ({ expanded }: QuickInputProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<Action | null>(null);
  const leadM = useLeadMutations();

  const launch = (a: Action) => { setMenuOpen(false); setActive(a); };

  const handleLeadSubmit = (values: Partial<Lead>) => {
    leadM.create.mutate(values, {
      onError: (e: unknown) => notifyApiError(e),
      onSuccess: () => setActive(null),
    });
  };

  return (
    <>
      <button
        onClick={() => setMenuOpen(true)}
        className={`flex items-center justify-center gap-2 w-full rounded-xl bg-ink text-white font-bold text-[13px] hover:bg-ink-soft transition-colors h-11 ${expanded ? 'px-3' : ''}`}
        title="Quick Input"
      >
        <Plus size={18} strokeWidth={2.5} />
        {expanded && 'Quick Input'}
      </button>

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} icon={<Plus size={20} />} title="Quick Input" subtitle="Pilih aksi cepat">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.key}
                onClick={() => launch(a.key)}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-border hover:border-primary hover:shadow-card text-left transition-all active:scale-[0.98]"
              >
                <div className={`w-11 h-11 rounded-xl ${a.color} text-white flex items-center justify-center shrink-0`}>
                  <Icon size={20} strokeWidth={2.3} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-ink">{a.label}</p>
                  <p className="text-[11px] text-muted font-medium">{a.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      <UnitFormModal open={active === 'unit'} onClose={() => setActive(null)} />
      <LeadFormModal open={active === 'lead'} onClose={() => setActive(null)} submitting={leadM.create.isPending} onSubmit={handleLeadSubmit} />
      <TestDriveFormModal open={active === 'testdrive'} onClose={() => setActive(null)} />
      <SaleFormModal open={active === 'sale'} onClose={() => setActive(null)} />
      <PaymentFormModal open={active === 'payment'} onClose={() => setActive(null)} />
    </>
  );
};
