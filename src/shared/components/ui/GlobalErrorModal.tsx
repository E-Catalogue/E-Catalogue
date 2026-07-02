import {
  WifiOff, TimerOff, ServerCrash, ServerCog, FileWarning, ShieldAlert,
  AlertTriangle, CheckCircle2, Info, type LucideIcon,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { hideToast, type GlobalErrorType, type ToastVariant } from '@/app/store/uiSlice';

const INFRA_ICONS: Partial<Record<GlobalErrorType, LucideIcon>> = {
  network: WifiOff,
  timeout: TimerOff,
  server: ServerCrash,
  maintenance: ServerCog,
  parsing: FileWarning,
  auth: ShieldAlert,
};

const VARIANT_STYLE: Record<ToastVariant, { Icon: LucideIcon; wrap: string }> = {
  success: { Icon: CheckCircle2, wrap: 'bg-accent-green/10 text-accent-green' },
  error:   { Icon: AlertTriangle, wrap: 'bg-semantic-error/10 text-semantic-error' },
  info:    { Icon: Info, wrap: 'bg-accent-blue/10 text-accent-blue' },
};

/** Modal notifikasi "satu pintu" — sukses (ceklis) & error/peringatan (tanda seru). */
export const GlobalErrorModal = () => {
  const { isOpen, title, message, type, variant } = useAppSelector((s) => s.ui.toast);
  const dispatch = useAppDispatch();
  const close = () => dispatch(hideToast());

  // Tentukan jenis: variant eksplisit → infra error → tebak dari title → info.
  const t = (title ?? '').toLowerCase();
  const kind: ToastVariant =
    variant
    ?? (type !== 'general' ? 'error'
      : t.startsWith('berhasil') || t.startsWith('sukses') ? 'success'
      : t.startsWith('gagal') || t.startsWith('error') ? 'error'
      : 'info');

  // Ikon infra spesifik (network/timeout/dll) menang bila ada; selain itu ikut variant.
  const Icon = INFRA_ICONS[type] ?? VARIANT_STYLE[kind].Icon;
  const wrap = type !== 'general' && INFRA_ICONS[type]
    ? 'bg-semantic-error/10 text-semantic-error'
    : VARIANT_STYLE[kind].wrap;

  return (
    <Modal open={isOpen} onClose={close} size="sm">
      <div className="text-center py-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${wrap}`}>
          <Icon size={28} strokeWidth={2.2} />
        </div>
        <h3 className="text-lg font-extrabold text-ink">{title}</h3>
        <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">{message}</p>
        <Button block onClick={close} className="mt-6">Tutup</Button>
      </div>
    </Modal>
  );
};
