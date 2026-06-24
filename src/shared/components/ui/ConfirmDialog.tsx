import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
}

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Hapus Data',
  message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  confirmLabel = 'Hapus',
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onClose} size="sm">
    <div className="text-center py-2">
      <div className="w-14 h-14 rounded-2xl bg-semantic-error/10 text-semantic-error flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={28} strokeWidth={2.2} />
      </div>
      <h3 className="text-lg font-extrabold text-ink">{title}</h3>
      <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">{message}</p>
      <div className="flex gap-2.5 mt-6">
        <Button variant="secondary" block onClick={onClose}>Batal</Button>
        <Button variant="danger" block onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </div>
    </div>
  </Modal>
);
