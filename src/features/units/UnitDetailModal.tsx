import { useState, type ChangeEvent } from 'react';
import { ArrowDown, ArrowUp, Calendar, Cog, Gauge, Hash, Image as ImageIcon, Pencil, Receipt, Star, Trash2, TrendingUp, Upload } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import type { Unit } from '@/features/units/unit.types';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { API_ORIGIN } from '@/core/api/client';
import { notifyApiError } from '@/core/api/notify';
import { useUnit, useUnitImageMutations } from './unit.hooks';

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
  const { data: detailRes } = useUnit(open ? unit?.id : undefined);
  const current = detailRes?.data ?? unit;
  const imageMutations = useUnitImageMutations(current?.id ?? '');
  const [imageError, setImageError] = useState('');

  if (!current) return null;
  
  const images = [...(current.unitImages ?? [])].sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999));
  const mainImage = images.find((img) => img.isMain) ?? images[0];
  const otrPrice = current.hargaOtrSaatIni ?? null;
  const targetPrice = current.hargaTargetJual ?? null;
  const marginBase = targetPrice ?? otrPrice;
  const margin = current.hargaBeli && marginBase && marginBase > current.hargaBeli ? marginBase - current.hargaBeli : null;

  const imageUrl = mainImage
    ? `${API_ORIGIN}/public/unit/${mainImage.filename}`
    : DEFAULT_CAR_IMAGE;

  const isNew = new Date().getTime() - new Date(current.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  const validateImage = (file: File) => {
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) return 'File harus JPG, JPEG, atau PNG.';
    if (file.size > 5 * 1024 * 1024) return 'Ukuran file maksimal 5MB.';
    return '';
  };
  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const error = validateImage(file);
    setImageError(error);
    if (error) return;
    imageMutations.upload.mutate(
      { file, isMain: images.length === 0 },
      { onError: (err) => notifyApiError(err) },
    );
    event.target.value = '';
  };
  const reorder = (imageId: string, direction: -1 | 1) => {
    const index = images.findIndex((img) => img.id === imageId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    imageMutations.reorder.mutate(next.map((img, idx) => ({ id: img.id, sequence: idx + 1 })), { onError: (err) => notifyApiError(err) });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
          {onEdit && <Button icon={<Pencil size={15} />} onClick={() => onEdit(current)}>Edit Unit</Button>}
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
          <span className="bg-surface/90 backdrop-blur text-ink text-[10px] font-bold px-2.5 py-1 rounded-lg">{current.platNomor}</span>
        </div>
        <div className="absolute top-3 right-3"><StatusBadge status={current.statusUnit} /></div>
      </div>

      <div className="flex items-start justify-between gap-3 mt-4">
        <div>
          <h3 className="text-xl font-extrabold text-ink leading-tight">{current.merek?.name}</h3>
          <p className="text-[13px] text-muted font-semibold">{current.tipe?.name}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-right shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-1">OTR</p>
            <p className="text-xl font-extrabold text-primary leading-none">{otrPrice ? formatCurrency(otrPrice) : '-'}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-1">Target</p>
            <p className="text-xl font-extrabold text-ink leading-none">{targetPrice ? formatCurrency(targetPrice) : '-'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
        <Spec icon={Calendar} label="Tahun" value={`${current.tahun}`} />
        <Spec icon={Gauge} label="Kilometer" value={`${formatNumber(current.kilometer)} KM`} />
        <Spec icon={Receipt} label="Pajak" value={current.tanggalPajak ? new Date(current.tanggalPajak).toLocaleDateString('id-ID') : '-'} />
        <Spec icon={Cog} label="Transmisi" value={current.transmisi === 'AUTOMATIC' ? 'Automatic (AT)' : 'Manual (MT)'} />
        <Spec icon={Hash} label="Warna" value={current.warna || '-'} />
        <Spec icon={Hash} label="Plat" value={current.platNomor || '-'} />
      </div>

      {(margin !== null || current.hargaBeli) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5">
          {current.hargaBeli ? <Spec icon={TrendingUp} label="Harga Beli" value={formatCurrency(current.hargaBeli)} /> : null}
          {current.hpp ? <Spec icon={TrendingUp} label="HPP" value={formatCurrency(current.hpp)} /> : null}
          {margin !== null ? <Spec icon={TrendingUp} label="Estimasi Margin" value={formatCurrency(margin)} /> : null}
        </div>
      )}

      <div className="mt-5 border-t border-divider pt-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[13px] font-extrabold text-ink">Galeri Unit</p>
            <p className="text-[11px] font-semibold text-muted">Upload, urutkan, dan pilih gambar utama</p>
          </div>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-[12px] font-bold cursor-pointer">
            <Upload size={14} /> Upload
            <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={uploadImage} className="hidden" />
          </label>
        </div>
        {imageError && <p className="text-[12px] font-semibold text-semantic-error mb-2">{imageError}</p>}
        {images.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl py-8 text-center text-muted">
            <ImageIcon size={28} className="mx-auto mb-2" />
            <p className="text-sm font-semibold">Belum ada gambar unit</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div key={img.id} className="relative rounded-2xl border border-border overflow-hidden bg-surface-soft">
                <img src={`${API_ORIGIN}/public/unit/${img.filename}`} alt={img.originalName} className="w-full aspect-[4/3] object-cover" />
                {img.isMain && <span className="absolute top-2 left-2 bg-primary text-white rounded-lg px-2 py-1 text-[10px] font-bold">Utama</span>}
                <div className="p-2 flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <button type="button" title="Naik" disabled={index === 0} onClick={() => reorder(img.id, -1)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary-light disabled:opacity-40"><ArrowUp size={14} /></button>
                    <button type="button" title="Turun" disabled={index === images.length - 1} onClick={() => reorder(img.id, 1)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary-light disabled:opacity-40"><ArrowDown size={14} /></button>
                    <button type="button" title="Jadikan utama" disabled={!!img.isMain} onClick={() => imageMutations.setMain.mutate(img.id, { onError: (err) => notifyApiError(err) })} className="p-1.5 rounded-lg text-muted hover:text-accent-amber hover:bg-accent-amber/10 disabled:opacity-40"><Star size={14} /></button>
                  </div>
                  <button type="button" title="Hapus" onClick={() => imageMutations.remove.mutate(img.id, { onError: (err) => notifyApiError(err) })} className="p-1.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
