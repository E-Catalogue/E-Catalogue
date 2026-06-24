import { Heart, Gauge, Fuel, Calendar, Pencil, Trash2, Eye } from 'lucide-react';
import type { Unit } from '@/data/types';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { StatusBadge } from './StatusBadge';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';

interface UnitCardProps {
  unit: Unit;
  onView?: (unit: Unit) => void;
  onEdit?: (unit: Unit) => void;
  onDelete?: (unit: Unit) => void;
}

export const UnitCard = ({ unit, onView, onEdit, onDelete }: UnitCardProps) => {
  const clickable = !!onView;
  return (
    <div
      onClick={() => onView?.(unit)}
      className={`group bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ${clickable ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-soft">
        <img
          src={unit.image}
          alt={`${unit.brand} ${unit.model}`}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {unit.isNew && (
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
          {unit.brand} {unit.model} {unit.variant}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-muted">
          <span className="flex items-center gap-1"><Calendar size={12} /> {unit.year}</span>
          <span className="flex items-center gap-1"><Fuel size={12} /> {unit.fuel}</span>
          <span className="flex items-center gap-1 truncate"><Gauge size={12} /> {formatNumber(unit.km)} KM</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-divider">
          <span className="font-extrabold text-primary text-[14px] truncate">{formatCurrency(unit.price)}</span>
          <StatusBadge status={unit.status} />
        </div>
      </div>
    </div>
  );
};
