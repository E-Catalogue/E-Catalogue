import type { UnitStatus } from '@/data/types';

type StatusConfig = { label: string; className: string; overlayClassName?: string };

const STATUS_MAP: Record<string, StatusConfig> = {
  // Unit statuses (Backend)
  INVENTORY: { label: 'Inventory', className: 'border-accent-blue/20 bg-accent-blue/10 text-accent-blue', overlayClassName: 'bg-accent-blue' },
  READY_STOCK: { label: 'Ready Stock', className: 'border-accent-green/20 bg-accent-green/10 text-accent-green', overlayClassName: 'bg-accent-green' },
  HOLD: { label: 'Hold', className: 'border-accent-amber/20 bg-accent-amber/10 text-accent-amber', overlayClassName: 'bg-accent-amber' },
  SOLD: { label: 'Terjual', className: 'border-semantic-error/20 bg-semantic-error/10 text-semantic-error', overlayClassName: 'bg-semantic-error' },
  // Payroll sales incentive statuses
  PENDING_AMOUNT: { label: 'Menunggu Nominal', className: 'bg-accent-amber/10 text-accent-amber' },
  DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  EARNED: { label: 'Siap Payroll', className: 'bg-accent-blue/10 text-accent-blue' },
  INCLUDED: { label: 'Masuk Payroll', className: 'bg-accent-purple/10 text-accent-purple' },
  PAID: { label: 'Dibayar', className: 'bg-accent-green/10 text-accent-green' },
  CANCELLED: { label: 'Dibatalkan', className: 'bg-primary/10 text-primary' },
  // Unit statuses (Old/Dummy - keep for compatibility if used elsewhere)
  READY: { label: 'Ready Stock', className: 'border-accent-green/20 bg-accent-green/10 text-accent-green', overlayClassName: 'bg-accent-green' },
  ready: { label: 'Ready Stock', className: 'border-accent-green/20 bg-accent-green/10 text-accent-green', overlayClassName: 'bg-accent-green' },
  rekondisi: { label: 'Rekondisi', className: 'bg-accent-amber/10 text-accent-amber' },
  BOOKED: { label: 'Booked', className: 'border-accent-amber/20 bg-accent-amber/10 text-accent-amber', overlayClassName: 'bg-accent-amber' },
  booked: { label: 'Booked', className: 'border-accent-amber/20 bg-accent-amber/10 text-accent-amber', overlayClassName: 'bg-accent-amber' },
  sold: { label: 'Terjual', className: 'border-semantic-error/20 bg-semantic-error/10 text-semantic-error', overlayClassName: 'bg-semantic-error' },
  Terjual: { label: 'Terjual', className: 'border-semantic-error/20 bg-semantic-error/10 text-semantic-error', overlayClassName: 'bg-semantic-error' },
  pembelian: { label: 'Pembelian', className: 'bg-accent-purple/10 text-accent-purple' },
  // Generic
  Lunas: { label: 'Lunas', className: 'bg-accent-green/10 text-accent-green' },
  DP: { label: 'DP', className: 'bg-accent-amber/10 text-accent-amber' },
  Proses: { label: 'Proses', className: 'bg-accent-blue/10 text-accent-blue' },
  Sukses: { label: 'Sukses', className: 'bg-accent-green/10 text-accent-green' },
  Pending: { label: 'Pending', className: 'bg-accent-amber/10 text-accent-amber' },
  Gagal: { label: 'Gagal', className: 'bg-primary/10 text-primary' },
  Terjadwal: { label: 'Terjadwal', className: 'bg-accent-blue/10 text-accent-blue' },
  Selesai: { label: 'Selesai', className: 'bg-accent-green/10 text-accent-green' },
  Batal: { label: 'Batal', className: 'bg-primary/10 text-primary' },
};

interface StatusBadgeProps {
  status: UnitStatus | string;
  label?: string;
  variant?: 'default' | 'overlay';
}

export const StatusBadge = ({ status, label, variant = 'default' }: StatusBadgeProps) => {
  const config = STATUS_MAP[status] ?? { label: status, className: 'bg-muted/10 text-muted' };
  const isOverlay = variant === 'overlay';
  return (
    <span className={`inline-flex min-h-7 items-center rounded-lg border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.06em] ${isOverlay ? `border-white/20 text-white shadow-sm backdrop-blur-sm ${config.overlayClassName ?? 'bg-ink/85'}` : `border-transparent ${config.className}`}`}>
      {label ?? config.label}
    </span>
  );
};
