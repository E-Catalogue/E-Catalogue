import { Heart, Gauge, Calendar, Pencil, Trash2, Eye, GitMerge, Fuel, MapPin, Palette } from 'lucide-react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Unit as BackendUnit } from '@/features/units/unit.types';
import type { Unit as MockUnit } from '@/data/types';
import { formatCurrency, formatNumber, formatTransmisi } from '@/core/utils/format';
import { StatusBadge } from './StatusBadge';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { API_ORIGIN } from '@/core/api/client';
import { HistoricalModeBadge } from './HistoricalModeBadge';

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

  const brandName = isMock ? (unit as MockUnit).brand : (unit as BackendUnit).merek?.name;
  const modelName = isMock ? `${(unit as MockUnit).model} ${(unit as MockUnit).variant}` : (unit as BackendUnit).tipe?.name;
  // Judul kartu = Nama Unit (backend) dengan fallback; mock tetap brand+model.
  const titleText = isMock
    ? `${brandName} ${modelName}`
    : (backendUnit.name?.trim() || [brandName, modelName].filter(Boolean).join(' ') || backendUnit.platNomor || '');
  const normalizedTitle = titleText.toLocaleLowerCase('id-ID');
  const identityLabel = modelName && normalizedTitle.includes(String(modelName).toLocaleLowerCase('id-ID'))
    ? brandName
    : [brandName, modelName].filter(Boolean).join(' ');
  const subtitleText = isMock ? '' : [identityLabel, backendUnit.platNomor].filter(Boolean).join(' · ');
  const tahun = isMock ? (unit as MockUnit).year : (unit as BackendUnit).tahun;
  const transmisi = formatTransmisi(isMock ? (unit as MockUnit).transmission : (unit as BackendUnit).transmisi);
  const km = isMock ? (unit as MockUnit).km : (unit as BackendUnit).kilometer;
  const statusUnit = statusOverride ?? (isMock ? (unit as MockUnit).status : (unit as BackendUnit).statusUnit);

  const bahanBakarLabel = isMock ? '' : (unit as BackendUnit).bahanBakar ?? '';
  const warna = isMock ? (unit as MockUnit).color : backendUnit.warna;

  return (
    <motion.div
      onClick={() => onView?.(unit)}
      whileHover={clickable ? { y: -4, transition: { duration: 0.2 } } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      className={`group overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface p-2 shadow-[0_12px_36px_rgba(19,27,46,0.07)] transition-all duration-300 hover:border-primary/25 hover:shadow-[0_22px_54px_rgba(19,27,46,0.13)] ${clickable ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-surface-soft">
        <motion.img
          src={imageUrl}
          alt={titleText}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        <div className="absolute left-3 top-3 z-10"><StatusBadge status={statusUnit as never} label={statusLabelOverride} variant="overlay" /></div>
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
          <div className="absolute right-2.5 top-2.5 flex gap-1.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
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

      <div className="px-2 pb-2 pt-4 sm:px-3 sm:pb-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-extrabold leading-snug text-ink sm:text-base" title={titleText}>
              {titleText}
            </h3>
            {subtitleText && (
              <p className="text-[11px] font-medium text-muted mt-0.5 truncate">{subtitleText}</p>
            )}
            {!isMock && backendUnit.historicalMode && (
              <HistoricalModeBadge mode={backendUnit.historicalMode} className="mt-1.5" />
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-surface-soft p-2 text-[10px] font-bold text-muted sm:text-[11px]">
          <span className="flex items-center gap-1.5 rounded-xl bg-surface px-2.5 py-2"><Calendar size={13} className="text-primary" /> {tahun}</span>
          <span className="flex min-w-0 items-center gap-1.5 rounded-xl bg-surface px-2.5 py-2"><Gauge size={13} className="shrink-0 text-primary" /><span className="truncate">{formatNumber(km)} KM</span></span>
          <span className="flex min-w-0 items-center gap-1.5 rounded-xl bg-surface px-2.5 py-2"><Palette size={13} className="shrink-0 text-primary" /><span className="truncate">{warna || '-'}</span></span>
          {!isMock && (
            <span className="flex min-w-0 items-center gap-1.5 rounded-xl bg-surface px-2.5 py-2 text-ink/80">
              <MapPin size={13} className="shrink-0 text-primary" /><span className="truncate">{backendUnit.branch?.nama || 'Cabang Utama'}</span>
            </span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-divider">
          {isMock ? (
            <span className="font-extrabold text-primary text-[15px] truncate">{formatCurrency(displayPrice)}</span>
          ) : (
            <div className="min-w-0 grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Harga</p>
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
