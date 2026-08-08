import { CalendarDays, Car, MapPin, Quote, Star, UserRound } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { usePublicTestimonial } from './landing.hooks';
import { CustomerLoader } from './CustomerStates';
import { formatTransmisi } from '@/core/utils/format';

export const TestimonialDetailModal = ({ id, onClose }: { id: string | null; onClose: () => void }) => {
  const { data, isLoading } = usePublicTestimonial(id ?? undefined);
  return (
    <Modal open={!!id} onClose={onClose} title="Cerita Pelanggan" icon={<Quote size={19} />} size="lg">
      {isLoading || !data ? <CustomerLoader /> : (
        <div className="space-y-5">
          {data.imageFilename && <img src={cmsImageUrl('testimoni', data.imageFilename) ?? ''} alt={`Serah terima ${data.name}`} className="aspect-[16/9] w-full rounded-2xl object-cover" />}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-primary-light text-primary grid place-items-center font-extrabold">
                {data.avatarFilename ? <img src={cmsImageUrl('testimoni', data.avatarFilename) ?? ''} alt={data.name} className="h-full w-full object-cover" /> : data.name[0]}
              </div>
              <div><h3 className="font-extrabold text-ink">{data.name}</h3><p className="text-[12px] font-semibold text-muted">{[data.role, data.city].filter(Boolean).join(' · ')}</p></div>
            </div>
            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className={i < data.rating ? 'fill-accent-amber text-accent-amber' : 'text-muted/20'} />)}</div>
          </div>
          <div><h2 className="text-xl font-extrabold text-ink">{data.title || 'Pengalaman membeli unit bersama kami'}</h2><p className="mt-2 text-[14px] font-medium leading-7 text-ink-soft">“{data.text}”</p></div>
          {data.unit && <div className="rounded-2xl border border-border bg-surface-soft p-4"><p className="mb-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Unit yang dibeli</p><div className="grid gap-3 sm:grid-cols-2 text-[12px] font-semibold text-ink-soft"><p className="flex gap-2"><Car size={15} className="text-primary" />{data.unit.name} · {data.unit.tahun}</p><p className="flex gap-2"><UserRound size={15} className="text-primary" />{[data.unit.merek, data.unit.tipe].filter(Boolean).join(' ')}</p><p className="flex gap-2"><MapPin size={15} className="text-primary" />{data.unit.branch?.name ?? 'Cabang showroom'}</p><p className="flex gap-2"><CalendarDays size={15} className="text-primary" />{data.handoverDate ? new Date(data.handoverDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}</p><p className="sm:col-span-2">{data.unit.warna} · {formatTransmisi(data.unit.transmisi)} · {data.unit.platNomor}</p></div></div>}
          {data.sales && <p className="text-[12px] font-semibold text-muted">Dilayani oleh <span className="font-extrabold text-ink">{data.sales.name}</span></p>}
        </div>
      )}
    </Modal>
  );
};
