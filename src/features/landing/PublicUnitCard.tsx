import { Share2, Gauge, Calendar, GitMerge, Fuel, MapPin, ArrowUpRight, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber, formatTransmisi } from '@/core/utils/format';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { BAHAN_BAKAR_LABEL, type BahanBakar } from '@/features/units/unit.types';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import type { CatalogCard } from './public.types';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';

export const PublicUnitCard = ({ card, onView }: { card: CatalogCard; onView?: (c: CatalogCard) => void }) => {
  const img = cmsImageUrl('unit', card.image?.filename) ?? DEFAULT_CAR_IMAGE;
  const merekTipe = `${card.merek?.name ?? card.brand ?? ''} ${card.tipe?.name ?? card.model ?? ''}`.trim();
  // Judul kartu = nama Unit (PRD §8.6); merek/tipe jadi subtitle (hindari duplikasi teks).
  const title = card.name?.trim() || merekTipe || '';
  const brandLabel = (card.merek?.name ?? card.brand ?? '').trim();
  const modelLabel = (card.tipe?.name ?? card.model ?? '').trim();
  const normalizedTitle = title.toLocaleLowerCase('id-ID');
  const subtitleBase = modelLabel && normalizedTitle.includes(modelLabel.toLocaleLowerCase('id-ID')) ? brandLabel : merekTipe;
  const variantLabel = card.variant && !normalizedTitle.includes(card.variant.toLocaleLowerCase('id-ID')) ? card.variant : '';
  const subtitle = [subtitleBase, variantLabel].filter(Boolean).join(' · ');

  const transmisiLabel = formatTransmisi(card.transmisi || card.transmission);
  const rawFuel = card.bahanBakar || card.fuel;
  const bahanBakarLabel = (card.bahanBakar ? (BAHAN_BAKAR_LABEL[card.bahanBakar as BahanBakar] ?? card.bahanBakar) : rawFuel) || '';
  const isSold = card.statusKatalog === 'SOLD' || card.statusUnit === 'SOLD' || card.isSold;
  const isHold = card.statusUnit === 'HOLD' || card.statusKatalog === 'BOOKED';
  const statusLabel = isSold ? 'Terjual' : isHold ? 'Dalam Pemesanan' : 'Ready Stock';
  const statusKey = isSold ? 'SOLD' : isHold ? 'HOLD' : 'READY_STOCK';

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
    <motion.article
      onClick={() => onView?.(card)}
      whileHover={onView ? { y: -6, transition: { duration: 0.2 } } : {}}
      whileTap={onView ? { scale: 0.98 } : {}}
      className={`group overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface p-2 shadow-[0_12px_36px_rgba(19,27,46,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_22px_54px_rgba(19,27,46,0.13)] ${onView ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-surface-soft">
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />

        <div className="absolute left-3 top-3 z-10"><StatusBadge status={statusKey} label={statusLabel} variant="overlay" /></div>

        {/* Top-right Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="group/share absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/45 bg-white/90 text-primary shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white"
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

      <div className="px-2 pb-2 pt-4 sm:px-3 sm:pb-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-extrabold leading-snug text-ink sm:text-base" title={title}>
              {title}
            </h3>
            {subtitle && <p className="mt-0.5 truncate text-[11px] font-medium text-muted">{subtitle}</p>}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-surface-soft p-2 text-[10px] font-bold text-muted sm:text-[11px]">
          <span className="flex min-w-0 items-center gap-1.5 rounded-xl bg-surface px-2.5 py-2"><Calendar size={13} className="shrink-0 text-primary" /> {card.tahun || card.year}</span>
          <span className="flex min-w-0 items-center gap-1.5 rounded-xl bg-surface px-2.5 py-2"><Gauge size={13} className="shrink-0 text-primary" /><span className="truncate">{formatNumber(card.kilometer || card.km)} KM</span></span>
          <span className="flex min-w-0 items-center gap-1.5 rounded-xl bg-surface px-2.5 py-2"><Palette size={13} className="shrink-0 text-primary" /><span className="truncate">{card.warna || card.color || '-'}</span></span>
          <span className="flex min-w-0 items-center gap-1.5 rounded-xl bg-surface px-2.5 py-2 text-ink/80">
            <MapPin size={13} className="shrink-0 text-primary" /><span className="truncate">{card.branch?.name || 'Cabang Utama'}</span>
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2 border-t border-divider pt-3">
          <div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-[.14em] text-muted">Harga</p><p className="truncate text-[15px] font-extrabold text-primary sm:text-base">{formatCurrency(card.harga || card.price)}</p></div>
          {onView && <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary"><ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>}
        </div>
      </div>
    </motion.article>
  );
};
