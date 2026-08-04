import { Heart, Gauge, Calendar, Pencil, Trash2, Eye, GitMerge, Fuel, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Unit as BackendUnit } from '@/features/units/unit.types';
import type { Unit as MockUnit } from '@/data/types';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { StatusBadge } from './StatusBadge';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { API_ORIGIN } from '@/core/api/client';

type UnitCardUnit = BackendUnit | MockUnit;

interface UnitCardProps<T extends UnitCardUnit> {
  unit: T;
  onView?: (unit: T) => void;
  onEdit?: (unit: T) => void;
  onDelete?: (unit: T) => void;
  actions?: ReactNode;
  statusOverride?: string;
  statusLabelOverride?: string;
}

export const UnitCard = <T extends UnitCardUnit>({ unit, onView, onEdit, onDelete, actions, statusOverride, statusLabelOverride }: UnitCardProps<T>) => {
  const clickable = !!onView;
  const isMock = 'brand' in unit;
  
  // Prioritas: gambar dengan isMain=true, lalu urutan sequence terkecil, lalu index pertama.
  const _backendImages = (unit as BackendUnit).unitImages ?? [];
  const _mainImg = _backendImages.find((img) => img.isMain) ?? _backendImages[0];
  const imageUrl = isMock
    ? (unit as MockUnit).image
    : (_mainImg
      ? `${API_ORIGIN}/public/unit/${_mainImg.filename}`
      : DEFAULT_CAR_IMAGE);

  const backendUnit = unit as BackendUnit;
  const otrPrice = isMock ? null : backendUnit.otrPrice;
  const targetPrice = isMock ? null : backendUnit.targetPrice;
  const displayPrice = isMock ? (unit as MockUnit).price : (otrPrice || targetPrice || backendUnit.purchaseCost || 0);

  const createdAt = isMock ? undefined : (unit as BackendUnit).createdAt;
  const isNew = isMock 
    ? (unit as MockUnit).isNew 
    : (createdAt && new Date().getTime() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000);

  const brandName = isMock ? (unit as MockUnit).brand : (unit as BackendUnit).merek?.name;
  const modelName = isMock ? `${(unit as MockUnit).model} ${(unit as MockUnit).variant}` : (unit as BackendUnit).tipe?.name;
  // Judul kartu = Nama Unit (backend) dengan fallback; mock tetap brand+model.
  const titleText = isMock
    ? `${brandName} ${modelName}`
    : (backendUnit.name?.trim() || [brandName, modelName].filter(Boolean).join(' ') || backendUnit.platNomor || '');
  const subtitleText = isMock
    ? ''
    : [[brandName, modelName].filter(Boolean).join(' '), backendUnit.platNomor].filter(Boolean).join(' · ');
  const tahun = isMock ? (unit as MockUnit).year : (unit as BackendUnit).tahun;
  const transmisi = isMock ? (unit as MockUnit).transmission : ((unit as BackendUnit).transmisi === 'AUTOMATIC' ? 'Automatic' : 'Manual');
  const km = isMock ? (unit as MockUnit).km : (unit as BackendUnit).kilometer;
  const statusUnit = statusOverride ?? (isMock ? (unit as MockUnit).status : (unit as BackendUnit).statusUnit);

  const bahanBakarLabel = isMock ? '' : (unit as BackendUnit).bahanBakar ?? '';

  return (
    <motion.div
      onClick={() => onView?.(unit)}
      whileHover={clickable ? { y: -4, transition: { duration: 0.2 } } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      className={`group bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 ${clickable ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-soft">
        <motion.img
          src={imageUrl}
          alt={titleText}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        {/* Gradient overlay bawah untuk kontras teks */}
        {statusUnit === 'SOLD' || statusUnit === 'sold' || statusUnit === 'Terjual' ? (
          <span className="absolute top-3 left-3 bg-semantic-error text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-sm">
            Terjual
          </span>
        ) : isNew ? (
          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-glow">
            Baru
          </span>
        ) : null}
        {/* Badge transmisi + bahan bakar di pojok kiri bawah gambar */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm ${
            transmisi === 'Automatic' || transmisi === 'AT' ? 'bg-accent-blue text-white' : 'bg-white text-slate-900'
          }`}>
            <GitMerge size={10} strokeWidth={2.4} /> {transmisi}
          </span>
          {bahanBakarLabel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white text-slate-900 shadow-sm uppercase">
              <Fuel size={10} strokeWidth={2.4} /> {bahanBakarLabel}
            </span>
          )}
        </div>
        {/* Jumlah gambar */}
        {_backendImages.length > 1 && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-black/50 text-white backdrop-blur-sm">
            {_backendImages.length} foto
          </span>
        )}

        {onEdit || onDelete || actions ? (
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
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-ink text-[14px] leading-snug truncate" title={titleText}>
              {titleText}
            </h3>
            {subtitleText && (
              <p className="text-[11px] font-medium text-muted mt-0.5 truncate">{subtitleText}</p>
            )}
          </div>
          <StatusBadge status={statusUnit as never} label={statusLabelOverride} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[11px] font-semibold text-muted">
          <span className="flex items-center gap-1"><Calendar size={12} /> {tahun}</span>
          <span className="flex items-center gap-1 truncate"><Gauge size={12} /> {formatNumber(km)} KM</span>
          {!isMock && (
            <span className="flex items-center gap-1 text-ink/80 truncate">
              <MapPin size={12} className="text-primary shrink-0" /> {backendUnit.branch?.nama || 'Cabang Utama'}
            </span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-divider">
          {isMock ? (
            <span className="font-extrabold text-primary text-[15px] truncate">{formatCurrency(displayPrice)}</span>
          ) : (
            <div className="min-w-0 grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">OTR</p>
                <p className="font-extrabold text-primary text-[14px] truncate">{otrPrice ? formatCurrency(otrPrice) : '-'}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Target</p>
                <p className="font-extrabold text-ink text-[14px] truncate">{targetPrice ? formatCurrency(targetPrice) : '-'}</p>
              </div>
            </div>
          )}
        </div>
        {actions && <div onClick={(event) => event.stopPropagation()} className="mt-3 pt-3 border-t border-divider">{actions}</div>}
      </div>
    </motion.div>
  );
};
