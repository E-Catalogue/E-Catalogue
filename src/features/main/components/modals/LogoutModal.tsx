import { Modal } from '@/shared/components/Modal';
import { LogOut } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const LogoutModal = ({ isOpen, onClose, onConfirm, isLoading = false }: LogoutModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose} 
      title="Konfirmasi Keluar"
      size="sm"
      icon={<LogOut className="text-semantic-error" />}
      actionAlignment="end"
      preventCloseOnOutsideClick={isLoading}
      actions={[
        { 
          label: 'Batal', 
          onClick: onClose, 
          variant: 'ghost' 
        },
        { 
          label: isLoading ? 'Memproses...' : 'Ya, Keluar', 
          onClick: onConfirm, 
          variant: 'danger' 
        }
      ]}
    >
      <div className="space-y-4 pt-2">
        <p className="text-sm font-medium text-content-secondary leading-relaxed">
          Apakah Anda yakin ingin keluar dari aplikasi POS Adonara?
        </p>
        
        {/* Kotak Peringatan */}
        <div className="bg-semantic-error/10 p-3.5 rounded-xl border border-semantic-error/20 flex gap-3 items-start">
          <div className="w-1.5 h-1.5 rounded-full bg-semantic-error mt-1.5 shrink-0 animate-pulse" />
          <p className="text-xs font-bold text-semantic-error leading-relaxed">
            Sesi Anda saat ini akan diakhiri. Pastikan semua transaksi yang sedang berjalan telah diselesaikan atau disimpan.
          </p>
        </div>
      </div>
    </Modal>
  );
};