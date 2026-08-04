import { Share2, Gauge, Calendar, GitMerge, Fuel, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber, formatTransmisi } from '@/core/utils/format';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { BAHAN_BAKAR_LABEL, type BahanBakar } from '@/features/units/unit.types';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import type { CatalogCard } from './public.types';

export const PublicUnitCard = ({ card, onView }: { card: CatalogCard; onView?: (c: CatalogCard) => void }) => {
  const img = cmsImageUrl('unit', card.image?.filename) ?? DEFAULT_CAR_IMAGE;
  const merekTipe = `${card.merek?.name ?? card.brand ?? ''} ${card.tipe?.name ?? card.model ?? ''}`.trim();
  // Judul kartu = nama Unit (PRD §8.6); merek/tipe jadi subtitle (hindari duplikasi teks).
  const title = card.name?.trim() || merekTipe || '';
  const subtitle = title !== merekTipe ? merekTipe : '';

  const transmisiLabel = formatTransmisi(card.transmisi || card.transmission);
  const rawFuel = card.bahanBakar || card.fuel;
  const bahanBakarLabel = (card.bahanBakar ? (BAHAN_BAKAR_LABEL[card.bahanBakar as BahanBakar] ?? card.bahanBakar) : rawFuel) || '';

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/katalog/${card.id}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {
        // Fallback
      });
    } else {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    store.dispatch(
      showToast({
        title: 'Berhasil',
        message: 'URL unit berhasil disalin ke clipboard',
        variant: 'success',
      })
    );
  };

  return (
    <motion.div
      onClick={() => onView?.(card)}
      whileHover={onView ? { y: -6, transition: { duration: 0.2 } } : {}}
      whileTap={onView ? { scale: 0.98 } : {}}
      className={`group bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 ${onView ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-soft">
        <motion.img
          src={img}
          alt={title}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Bottom gradient overlay for badges readability */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* Top-left Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {card.isNew && <span className="bg-primary text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-glow">Baru</span>}
          {card.statusUnit === 'INVENTORY' && <span className="bg-accent-blue text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg">Inventory</span>}
          {card.statusUnit === 'HOLD' && <span className="bg-accent-amber text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg">Hold</span>}
          {card.statusKatalog === 'BOOKED' && <span className="bg-accent-amber text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg">Booked</span>}
          {(card.statusKatalog === 'SOLD' || card.statusUnit === 'SOLD' || card.isSold) && (
            <span className="bg-semantic-error text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-sm">
              Terjual
            </span>
          )}
        </div>

        {/* Top-right Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white hover:bg-white/90 flex items-center justify-center text-primary transition-all shadow-md z-10 group/share cursor-pointer"
          title="Salin Link Unit"
          aria-label="Salin Link Unit"
        >
          <Share2 size={14} strokeWidth={2.5} className="text-primary group-hover/share:scale-110 transition-transform" />
        </button>

        {/* Bottom-left Badges (Transmisi & Bahan Bakar) */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {transmisiLabel && transmisiLabel !== '-' && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm ${
              transmisiLabel === 'Automatic' || transmisiLabel.includes('Auto') ? 'bg-accent-blue text-white' : 'bg-white text-slate-900'
            }`}>
              <GitMerge size={10} strokeWidth={2.4} /> {transmisiLabel}
            </span>
          )}
          {bahanBakarLabel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white text-slate-900 shadow-sm uppercase">
              <Fuel size={10} strokeWidth={2.4} /> {bahanBakarLabel}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-ink text-[14px] leading-snug truncate" title={title}>
              {title}
            </h3>
            {subtitle && <p className="text-[11px] font-medium text-muted mt-0.5 truncate">{subtitle}{card.variant ? ` · ${card.variant}` : ''}</p>}
          </div>
          {card.statusKatalog === 'SOLD' || card.statusUnit === 'SOLD' || card.isSold ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-semantic-error/10 text-semantic-error border border-semantic-error/20 shrink-0">
              Terjual
            </span>
          ) : card.statusUnit === 'INVENTORY' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-accent-blue/10 text-accent-blue border border-accent-blue/20 shrink-0">
              Inventory
            </span>
          ) : card.statusUnit === 'HOLD' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-accent-amber/10 text-accent-amber border border-accent-amber/20 shrink-0">
              Hold
            </span>
          ) : card.statusKatalog === 'BOOKED' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-accent-amber/10 text-accent-amber border border-accent-amber/20 shrink-0">
              Booked
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-accent-green/10 text-accent-green border border-accent-green/20 shrink-0">
              Ready Stock
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 text-[11px] font-semibold text-muted">
          <span className="flex items-center gap-1"><Calendar size={12} /> {card.tahun || card.year}</span>
          <span className="flex items-center gap-1 truncate"><Gauge size={12} /> {formatNumber(card.kilometer || card.km)} KM</span>
          <span className="flex items-center gap-1 text-ink/80 truncate">
            <MapPin size={12} className="text-primary shrink-0" /> {card.branch?.name || 'Cabang Utama'}
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 mt-3 pt-3 border-t border-divider">
          <span className="font-extrabold text-primary text-[15px] truncate">{formatCurrency(card.harga || card.price)}</span>
          <span className="text-[11px] font-semibold text-muted">{card.warna || card.color}</span>
        </div>
      </div>
    </motion.div>
  );
};

