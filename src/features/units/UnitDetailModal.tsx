import { Calendar, Fuel, Gauge, Cog, Palette, Hash, Clock, TrendingUp, Pencil } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import type { Unit } from '@/data/types';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';

interface UnitDetailModalProps {
  open: boolean;
  onClose: () => void;
  unit: Unit | null;
  onEdit?: (unit: Unit) => void;
}

const Spec = ({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) => (
  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-soft">
    <div className="w-9 h-9 rounded-lg bg-surface text-primary flex items-center justify-center shrink-0 border border-border">
      <Icon size={16} strokeWidth={2.3} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[13px] font-extrabold text-ink truncate">{value}</p>
    </div>
  </div>
);

export const UnitDetailModal = ({ open, onClose, unit, onEdit }: UnitDetailModalProps) => {
  if (!unit) return null;
  const margin = unit.buyPrice ? unit.price - unit.buyPrice : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
          {onEdit && <Button icon={<Pencil size={15} />} onClick={() => onEdit(unit)}>Edit Unit</Button>}
        </>
      }
    >
      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-surface-soft">
        <img
          src={unit.image}
          alt=""
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {unit.isNew && <span className="bg-primary text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-glow">Baru</span>}
          <span className="bg-surface/90 backdrop-blur text-ink text-[10px] font-bold px-2.5 py-1 rounded-lg">{unit.code}</span>
        </div>
        <div className="absolute top-3 right-3"><StatusBadge status={unit.status} /></div>
      </div>

      <div className="flex items-start justify-between gap-3 mt-4">
        <div>
          <h3 className="text-xl font-extrabold text-ink leading-tight">{unit.brand} {unit.model}</h3>
          <p className="text-[13px] text-muted font-semibold">{unit.variant}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-extrabold text-primary leading-none">{formatCurrency(unit.price)}</p>
          <p className="text-[11px] text-muted font-medium mt-1">Harga jual</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
        <Spec icon={Calendar} label="Tahun" value={`${unit.year}`} />
        <Spec icon={Gauge} label="Kilometer" value={`${formatNumber(unit.km)} KM`} />
        <Spec icon={Fuel} label="Bahan Bakar" value={unit.fuel} />
        <Spec icon={Cog} label="Transmisi" value={unit.transmission} />
        <Spec icon={Palette} label="Warna" value={unit.color || '-'} />
        <Spec icon={Hash} label="Plat" value={unit.plate || '-'} />
      </div>

      {(margin !== null || unit.daysInStock || unit.rekondisiProgress !== undefined) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5">
          {unit.buyPrice ? <Spec icon={TrendingUp} label="Harga Beli" value={formatCurrency(unit.buyPrice)} /> : null}
          {margin !== null ? <Spec icon={TrendingUp} label="Estimasi Margin" value={formatCurrency(margin)} /> : null}
          {unit.daysInStock ? <Spec icon={Clock} label="Lama Stok" value={`${unit.daysInStock} Hari`} /> : null}
        </div>
      )}

      {unit.status === 'rekondisi' && unit.rekondisiProgress !== undefined && (
        <div className="mt-4 p-4 rounded-xl bg-accent-orange/5 border border-accent-orange/20">
          <div className="flex items-center justify-between text-[12px] font-bold mb-2">
            <span className="text-accent-orange">Progress Rekondisi</span>
            <span className="text-accent-orange">{unit.rekondisiProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface overflow-hidden">
            <div className="h-full rounded-full bg-accent-orange transition-all" style={{ width: `${unit.rekondisiProgress}%` }} />
          </div>
        </div>
      )}
    </Modal>
  );
};
