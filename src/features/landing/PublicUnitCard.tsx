import { Heart, Gauge, Calendar, GitMerge } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import type { CatalogCard } from './public.types';

export const PublicUnitCard = ({ card, onView }: { card: CatalogCard; onView?: (c: CatalogCard) => void }) => {
  const img = cmsImageUrl('unit', card.image?.filename) ?? DEFAULT_CAR_IMAGE;
  const merekTipe = `${card.merek?.name ?? ''} ${card.tipe?.name ?? ''}`.trim();
  // Judul kartu = nama Unit (PRD §8.6); merek/tipe jadi subtitle (hindari duplikasi teks).
  const title = card.name?.trim() || merekTipe || '';
  const subtitle = title !== merekTipe ? merekTipe : '';

  return (
    <motion.div
      onClick={() => onView?.(card)}
      whileHover={onView ? { y: -6, transition: { duration: 0.2 } } : {}}
      whileTap={onView ? { scale: 0.98 } : {}}
      className={`group bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-card-hover ${onView ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-soft">
        <motion.img
          src={img} alt={title} loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }} transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {card.isNew && <span className="bg-primary text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-glow">Baru</span>}
          {card.statusKatalog === 'BOOKED' && <span className="bg-accent-amber text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg">Booked</span>}
        </div>
        <button onClick={(e) => e.stopPropagation()} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center text-muted hover:text-primary transition-colors">
          <Heart size={16} strokeWidth={2.4} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-extrabold text-ink text-[14px] leading-snug truncate" title={title}>
          {title}
        </h3>
        {subtitle && <p className="text-[11px] font-medium text-muted mt-0.5 truncate">{subtitle}{card.variant ? ` · ${card.variant}` : ''}</p>}
        <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-muted">
          <span className="flex items-center gap-1"><Calendar size={12} /> {card.tahun}</span>
          <span className="flex items-center gap-1"><GitMerge size={12} /> {card.transmisi}</span>
          <span className="flex items-center gap-1 truncate"><Gauge size={12} /> {formatNumber(card.kilometer)} KM</span>
        </div>
        <div className="flex items-end justify-between gap-2 mt-3 pt-3 border-t border-divider">
          <span className="font-extrabold text-primary text-[15px] truncate">{formatCurrency(card.harga)}</span>
          <span className="text-[11px] font-semibold text-muted">{card.warna}</span>
        </div>
      </div>
    </motion.div>
  );
};
