import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean; onClose: () => void; title: string; message: string;
  onConfirm: () => void; confirmText?: string; isDanger?: boolean;
  // Untuk aksi async: tampilkan loader & cegah double-click. Saat true, parent yang menutup modal.
  isLoading?: boolean;
  loadingText?: string;
  closeOnConfirm?: boolean;
  // Input catatan opsional (mis. alasan pembatalan)
  withNotes?: boolean;
  notesValue?: string;
  onNotesChange?: (value: string) => void;
  notesLabel?: string;
  notesPlaceholder?: string;
}

export const ConfirmationModal = ({
  isOpen, onClose, title, message, onConfirm, confirmText = 'Ya, Lanjutkan', isDanger = true,
  isLoading = false, loadingText, closeOnConfirm = true,
  withNotes = false, notesValue = '', onNotesChange, notesLabel = 'Catatan (opsional)', notesPlaceholder = 'Tulis catatan...',
}: ConfirmationModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      size="sm"
      actionAlignment="center"
      preventCloseOnOutsideClick={isLoading}
      actions={[
        { label: 'Batal', onClick: onClose, variant: 'ghost', disabled: isLoading },
        {
          label: isLoading && loadingText ? loadingText : confirmText,
          onClick: () => {
            if (isLoading) return;
            onConfirm();
            if (closeOnConfirm) onClose();
          },
          variant: isDanger ? 'danger' : 'primary',
          loading: isLoading,
        },
      ]}
    >
      <div className="flex flex-col items-center text-center pb-2 pt-4">
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner ${isDanger ? 'bg-semantic-error/10 text-semantic-error' : 'bg-semantic-warning/10 text-semantic-warning'}`}>
          <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-content-secondary font-medium text-sm md:text-base leading-relaxed px-2 md:px-4">{message}</p>

        {withNotes && (
          <div className="w-full text-left mt-5">
            <label className="block text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-1.5 pl-1">{notesLabel}</label>
            <textarea
              value={notesValue}
              onChange={(e) => onNotesChange?.(e.target.value)}
              disabled={isLoading}
              rows={3}
              placeholder={notesPlaceholder}
              className="w-full bg-[#F8F6F2] border-2 border-transparent px-4 py-3 rounded-xl text-xs font-bold text-customGray-light focus:outline-none focus:bg-white focus:border-[#86673A] transition-colors resize-none disabled:opacity-60"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};