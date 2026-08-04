import type { UnitStatus } from '@/data/types';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  // Unit statuses (Backend)
  INVENTORY: { label: 'Inventory', className: 'bg-accent-blue/10 text-accent-blue' },
  READY_STOCK: { label: 'Ready Stock', className: 'bg-accent-green/10 text-accent-green' },
  HOLD: { label: 'Hold', className: 'bg-accent-amber/10 text-accent-amber' },
  SOLD: { label: 'Terjual', className: 'bg-semantic-error/10 text-semantic-error border border-semantic-error/20' },
  // Payroll sales incentive statuses
  PENDING_AMOUNT: { label: 'Menunggu Nominal', className: 'bg-accent-amber/10 text-accent-amber' },
  DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  EARNED: { label: 'Siap Payroll', className: 'bg-accent-blue/10 text-accent-blue' },
  INCLUDED: { label: 'Masuk Payroll', className: 'bg-accent-purple/10 text-accent-purple' },
  PAID: { label: 'Dibayar', className: 'bg-accent-green/10 text-accent-green' },
  CANCELLED: { label: 'Dibatalkan', className: 'bg-primary/10 text-primary' },
  // Unit statuses (Old/Dummy - keep for compatibility if used elsewhere)
  READY: { label: 'Ready Stock', className: 'bg-accent-green/10 text-accent-green' },
  ready: { label: 'Ready Stock', className: 'bg-accent-green/10 text-accent-green' },
  rekondisi: { label: 'Rekondisi', className: 'bg-accent-amber/10 text-accent-amber' },
  BOOKED: { label: 'Booked', className: 'bg-accent-amber/10 text-accent-amber' },
  booked: { label: 'Booked', className: 'bg-accent-amber/10 text-accent-amber' },
  sold: { label: 'Terjual', className: 'bg-semantic-error/10 text-semantic-error border border-semantic-error/20' },
  Terjual: { label: 'Terjual', className: 'bg-semantic-error/10 text-semantic-error border border-semantic-error/20' },
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
}

export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const config = STATUS_MAP[status] ?? { label: status, className: 'bg-muted/10 text-muted' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${config.className}`}>
      {label ?? config.label}
    </span>
  );
};
