import { Calendar, Gauge, Cog, Palette, Hash, Clock, TrendingUp, Pencil, Receipt } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import type { Unit } from '@/features/units/unit.types';
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
  
  const displayPrice = unit.hargaOtrSaatIni || unit.hargaTargetJual || unit.hargaBeli || 0;
  const margin = unit.hargaBeli && displayPrice > unit.hargaBeli ? displayPrice - unit.hargaBeli : null;

  const imageUrl = unit.unitImages && unit.unitImages.length > 0
    ? `${import.meta.env.VITE_API_URL}/public/unit/${unit.unitImages[0].filename}`
    : DEFAULT_CAR_IMAGE;

  const isNew = new Date().getTime() - new Date(unit.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;

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
          src={imageUrl}
          alt=""
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew && <span className="bg-primary text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-glow">Baru</span>}
          <span className="bg-surface/90 backdrop-blur text-ink text-[10px] font-bold px-2.5 py-1 rounded-lg">{unit.platNomor}</span>
        </div>
        <div className="absolute top-3 right-3"><StatusBadge status={unit.statusUnit} /></div>
      </div>

      <div className="flex items-start justify-between gap-3 mt-4">
        <div>
          <h3 className="text-xl font-extrabold text-ink leading-tight">{unit.merek?.name}</h3>
          <p className="text-[13px] text-muted font-semibold">{unit.tipe?.name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-extrabold text-primary leading-none">{formatCurrency(displayPrice)}</p>
          <p className="text-[11px] text-muted font-medium mt-1">Harga OTR / Target</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
        <Spec icon={Calendar} label="Tahun" value={`${unit.tahun}`} />
        <Spec icon={Gauge} label="Kilometer" value={`${formatNumber(unit.kilometer)} KM`} />
        <Spec icon={Receipt} label="Pajak" value={unit.tanggalPajak ? new Date(unit.tanggalPajak).toLocaleDateString('id-ID') : '-'} />
        <Spec icon={Cog} label="Transmisi" value={unit.transmisi === 'AUTOMATIC' ? 'Automatic (AT)' : 'Manual (MT)'} />
        <Spec icon={Palette} label="Warna" value={unit.warna || '-'} />
        <Spec icon={Hash} label="Plat" value={unit.platNomor || '-'} />
      </div>

      {(margin !== null || unit.hargaBeli) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5">
          {unit.hargaBeli ? <Spec icon={TrendingUp} label="Harga Beli" value={formatCurrency(unit.hargaBeli)} /> : null}
          {unit.hpp ? <Spec icon={TrendingUp} label="HPP" value={formatCurrency(unit.hpp)} /> : null}
          {margin !== null ? <Spec icon={TrendingUp} label="Estimasi Margin" value={formatCurrency(margin)} /> : null}
        </div>
      )}

      {/* Relasi Kelengkapan / Dokumen bisa ditampilkan di sini jika diperlukan nanti */}
    </Modal>
  );
};
