import { Headset, MapPin, Phone, Loader2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { buildWhatsAppUrl } from '@/core/utils/whatsapp';
import { usePublicSales } from './landing.hooks';

interface SalesPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Teks pesan WA yang sudah dirakit (mis. minat pada unit tertentu). */
  waText: string;
  /** Nomor WA cadangan (dari site settings) bila sales belum punya nomor / belum ada data sales. */
  fallbackNumber?: string | null;
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export const SalesPickerModal = ({ open, onClose, waText, fallbackNumber }: SalesPickerModalProps) => {
  const { data: sales, isLoading } = usePublicSales(open);
  const list = sales ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Headset size={20} />}
      title="Hubungi Sales Kami"
      subtitle="Pilih sales untuk chat langsung via WhatsApp"
      size="md"
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted"><Loader2 size={26} className="animate-spin" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-[13px] font-semibold text-ink-soft mb-4">Chat langsung dengan tim kami untuk info unit ini.</p>
          <a href={buildWhatsAppUrl(fallbackNumber, waText)} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-green text-white font-bold text-[14px] px-5 py-3 hover:brightness-95 transition-all">
            <FaWhatsapp size={18} /> Chat via WhatsApp
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {list.map((s) => {
            const number = s.phone || fallbackNumber;
            return (
              <div key={s.id} className="rounded-2xl border border-border bg-surface-soft p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm shrink-0">{initials(s.name)}</div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-ink truncate">{s.name}</p>
                    <p className="text-[11px] font-semibold text-primary">Sales Consultant</p>
                  </div>
                </div>
                <div className="space-y-1 text-[12px] font-medium text-muted">
                  {s.branchName && <p className="flex items-center gap-1.5"><MapPin size={12} className="text-primary shrink-0" /> {s.branchName}</p>}
                  {number && <p className="flex items-center gap-1.5"><Phone size={12} className="text-primary shrink-0" /> {number}</p>}
                </div>
                <a
                  href={buildWhatsAppUrl(number, waText)}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!number}
                  onClick={(e) => { if (!number) e.preventDefault(); }}
                  className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] px-4 py-2.5 transition-all ${
                    number ? 'bg-accent-green text-white hover:brightness-95' : 'bg-muted/10 text-muted cursor-not-allowed'
                  }`}
                >
                  <FaWhatsapp size={16} /> {number ? 'Chat WhatsApp' : 'Nomor belum tersedia'}
                </a>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
