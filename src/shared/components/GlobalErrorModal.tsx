import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { hideGlobalError } from '@/app/store/uiSlice';
import { clearCredentials } from '@/app/store/authSlice';
import { Modal } from './Modal';
import { WifiOff, ServerCrash, ShieldAlert, AlertTriangle, TimerOff, ServerCog, FileWarning } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export const GlobalErrorModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isOpen, title, message, type } = useSelector((state: RootState) => state.ui.globalErrorModal);

  const handleClose = () => {
    dispatch(hideGlobalError());
    
    // Jika error karena Auth (Token Expired), paksa ke halaman login saat ditutup
    if (type === 'auth') {
       dispatch(clearCredentials());
       navigate({ to: '/' });
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'network': return <WifiOff className="text-semantic-error" size={28} />;
      case 'timeout': return <TimerOff className="text-semantic-error" size={28} />;
      case 'server': return <ServerCrash className="text-semantic-error" size={28} />;
      case 'maintenance': return <ServerCog className="text-semantic-warning" size={28} />;
      case 'parsing': return <FileWarning className="text-semantic-warning" size={28} />;
      case 'auth': return <ShieldAlert className="text-semantic-warning" size={28} />;
      default: return <AlertTriangle className="text-semantic-warning" size={28} />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      icon={getIcon()}
      actions={[
        { label: type === 'auth' ? 'Login Kembali' : 'Tutup', onClick: handleClose, variant: 'primary' }
      ]}
      preventCloseOnOutsideClick={type === 'auth'} // Wajib tekan tombol jika Auth error
    >
      <p className="text-sm font-medium text-content-secondary leading-relaxed">
        {message}
      </p>
    </Modal>
  );
};