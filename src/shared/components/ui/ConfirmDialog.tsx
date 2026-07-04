import { AlertTriangle, type LucideIcon } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

type Tone = 'danger' | 'warning' | 'primary';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  icon?: LucideIcon;
  loading?: boolean;
  /** Tutup otomatis setelah confirm (default true). Set false untuk flow async yang menutup sendiri. */
  closeOnConfirm?: boolean;
}

const TONES: Record<Tone, { wrap: string; btn: 'danger' | 'primary' }> = {
  danger: { wrap: 'bg-semantic-error/10 text-semantic-error', btn: 'danger' },
  warning: { wrap: 'bg-accent-amber/15 text-accent-amber', btn: 'primary' },
  primary: { wrap: 'bg-primary-light text-primary', btn: 'primary' },
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Hapus Data',
  message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  tone = 'danger',
  icon: Icon = AlertTriangle,
  loading = false,
  closeOnConfirm = true,
}: ConfirmDialogProps) => {
  const t = TONES[tone];
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${t.wrap}`}>
          <Icon size={28} strokeWidth={2.2} />
        </div>
        <h3 className="text-lg font-extrabold text-ink">{title}</h3>
        <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">{message}</p>
        <div className="flex gap-2.5 mt-6">
          <Button variant="secondary" block onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button variant={t.btn} block loading={loading} onClick={() => { onConfirm(); if (closeOnConfirm && !loading) onClose(); }}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
