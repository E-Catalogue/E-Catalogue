import { Heart, Gauge, Calendar, Pencil, Trash2, Eye, GitMerge } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Unit as BackendUnit } from '@/features/units/unit.types';
import type { Unit as MockUnit } from '@/data/types';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { StatusBadge } from './StatusBadge';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';

type UnitCardUnit = BackendUnit | MockUnit;

interface UnitCardProps<T extends UnitCardUnit> {
  unit: T;
  onView?: (unit: T) => void;
  onEdit?: (unit: T) => void;
  onDelete?: (unit: T) => void;
}

export const UnitCard = <T extends UnitCardUnit>({ unit, onView, onEdit, onDelete }: UnitCardProps<T>) => {
  const clickable = !!onView;
  const isMock = 'brand' in unit;
  
  const _backendImg = (unit as BackendUnit).unitImages?.[0];
  const imageUrl = isMock
    ? (unit as MockUnit).image
    : (_backendImg
      ? `${import.meta.env.VITE_API_URL}/public/unit/${_backendImg.filename}`
      : DEFAULT_CAR_IMAGE);

  const backendUnit = unit as BackendUnit;
  const otrPrice = isMock ? null : backendUnit.hargaOtrSaatIni;
  const targetPrice = isMock ? null : backendUnit.hargaTargetJual;
  const displayPrice = isMock ? (unit as MockUnit).price : (otrPrice || targetPrice || backendUnit.hargaBeli || 0);

  const createdAt = isMock ? undefined : (unit as BackendUnit).createdAt;
  const isNew = isMock 
    ? (unit as MockUnit).isNew 
    : (createdAt && new Date().getTime() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000);

  const brandName = isMock ? (unit as MockUnit).brand : (unit as BackendUnit).merek?.name;
  const modelName = isMock ? `${(unit as MockUnit).model} ${(unit as MockUnit).variant}` : (unit as BackendUnit).tipe?.name;
  const tahun = isMock ? (unit as MockUnit).year : (unit as BackendUnit).tahun;
  const transmisi = isMock ? (unit as MockUnit).transmission : ((unit as BackendUnit).transmisi === 'AUTOMATIC' ? 'AT' : 'MT');
  const km = isMock ? (unit as MockUnit).km : (unit as BackendUnit).kilometer;
  const statusUnit = isMock ? (unit as MockUnit).status : (unit as BackendUnit).statusUnit;

  return (
    <motion.div
      onClick={() => onView?.(unit)}
      whileHover={clickable ? { y: -6, transition: { duration: 0.2 } } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      className={`group bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-card-hover ${clickable ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-soft">
        <motion.img
          src={imageUrl}
          alt={`${brandName} ${modelName}`}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {isNew && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-glow">
            Baru
          </span>
        )}

        {onEdit || onDelete ? (
          <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onView && (
              <button onClick={(e) => { e.stopPropagation(); onView(unit); }} className="w-8 h-8 rounded-full bg-surface/95 backdrop-blur flex items-center justify-center text-muted hover:text-primary shadow-sm transition-colors" title="Detail">
                <Eye size={15} strokeWidth={2.3} />
              </button>
            )}
            {onEdit && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(unit); }} className="w-8 h-8 rounded-full bg-surface/95 backdrop-blur flex items-center justify-center text-muted hover:text-accent-blue shadow-sm transition-colors" title="Edit">
                <Pencil size={14} strokeWidth={2.3} />
              </button>
            )}
            {onDelete && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(unit); }} className="w-8 h-8 rounded-full bg-surface/95 backdrop-blur flex items-center justify-center text-muted hover:text-semantic-error shadow-sm transition-colors" title="Hapus">
                <Trash2 size={14} strokeWidth={2.3} />
              </button>
            )}
          </div>
        ) : (
          <button onClick={(e) => e.stopPropagation()} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center text-muted hover:text-primary transition-colors">
            <Heart size={16} strokeWidth={2.4} />
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-extrabold text-ink text-[14px] leading-snug truncate">
          {brandName} {modelName}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-muted">
          <span className="flex items-center gap-1"><Calendar size={12} /> {tahun}</span>
          <span className="flex items-center gap-1"><GitMerge size={12} /> {transmisi}</span>
          <span className="flex items-center gap-1 truncate"><Gauge size={12} /> {formatNumber(km)} KM</span>
        </div>
        <div className="flex items-end justify-between gap-2 mt-3 pt-3 border-t border-divider">
          {isMock ? (
            <span className="font-extrabold text-primary text-[14px] truncate">{formatCurrency(displayPrice)}</span>
          ) : (
            <div className="min-w-0 grid grid-cols-2 gap-3 flex-1">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">OTR</p>
                <p className="font-extrabold text-primary text-[13px] truncate">{otrPrice ? formatCurrency(otrPrice) : '-'}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Target</p>
                <p className="font-extrabold text-ink text-[13px] truncate">{targetPrice ? formatCurrency(targetPrice) : '-'}</p>
              </div>
            </div>
          )}
          <StatusBadge status={statusUnit as never} />
        </div>
      </div>
    </motion.div>
  );
};
