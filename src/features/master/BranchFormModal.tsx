import { useState, type FormEvent } from 'react';
import { Building2 } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { useBranchPicLookup } from './master.hooks';
import type { Branch } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Branch | null;
  submitting?: boolean;
  onSubmit: (values: Partial<Branch>) => void;
}

const empty = (): Partial<Branch> => ({ nama: '', code: '', picId: '', lokasi: '', longlat: '', kontak: '', isPublic: false, publicSortOrder: 0, publicDescription: '', businessHours: '', mapLat: null, mapLng: null });

export const BranchFormModal = ({ open, onClose, item, submitting, onSubmit }: Props) => {
  const [form, setForm] = useState<Partial<Branch>>(item ?? empty());

  // PIC harus user terdaftar & aktif (PRD §12.4). Lookup module-owned `/branches/lookups/pics` (§4.3).
  const { data: pics = [], isLoading: picsLoading } = useBranchPicLookup(open);
  const picOptions = pics.map((u) => ({ value: u.id, label: u.name, sublabel: u.username }));

  const set = (k: keyof Branch, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      nama: (form.nama ?? '').trim(),
      code: (form.code ?? '').trim().toUpperCase(),
      picId: form.picId || undefined,
      lokasi: (form.lokasi ?? '').trim(),
      longlat: (form.longlat ?? '').trim(),
      kontak: (form.kontak ?? '').trim(),
      isPublic: !!form.isPublic,
      publicSortOrder: Number(form.publicSortOrder ?? 0),
      publicDescription: (form.publicDescription ?? '').trim() || null,
      businessHours: (form.businessHours ?? '').trim() || null,
      mapLat: form.mapLat == null || form.mapLat === ('' as unknown as number) ? null : Number(form.mapLat),
      mapLng: form.mapLng == null || form.mapLng === ('' as unknown as number) ? null : Number(form.mapLng),
    });
  };

  return (
    <Modal
      open={open} onClose={onClose} icon={<Building2 size={20} />}
      title={item ? 'Edit Cabang' : 'Tambah Cabang'}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="branch-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}
    >
      <form id="branch-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nama Cabang" required value={form.nama ?? ''} onChange={(e) => set('nama', e.target.value)} placeholder="Kantor Pusat" />
        <TextField label="Kode" required value={form.code ?? ''} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="KP-01" />
        <SearchableSelect label="PIC (Penanggung Jawab)" required wrapClass="sm:col-span-2" value={form.picId ?? ''} onChange={(v) => set('picId', v)} options={picOptions} loading={picsLoading} placeholder="Pilih PIC" searchPlaceholder="Cari user..." emptyMessage="Tidak ada user aktif." />
        <TextField label="Lokasi" required wrapClass="sm:col-span-2" value={form.lokasi ?? ''} onChange={(e) => set('lokasi', e.target.value)} placeholder="Jakarta Selatan" />
        <TextField label="Koordinat (long,lat)" required value={form.longlat ?? ''} onChange={(e) => set('longlat', e.target.value)} placeholder="-6.2, 106.81" />
        <TextField label="Kontak" required value={form.kontak ?? ''} onChange={(e) => set('kontak', e.target.value)} placeholder="021-123456" />
        <div className="sm:col-span-2 border-t border-border pt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={!!form.isPublic} onChange={(e) => set('isPublic', e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
            <span><span className="block text-sm font-bold text-ink">Tampilkan sebagai lokasi showroom publik</span><span className="block text-[11px] text-muted mt-0.5">Cabang akan muncul di beranda, kontak, dan peta publik.</span></span>
          </label>
        </div>
        <TextField label="Latitude" required={!!form.isPublic} type="number" step="any" value={form.mapLat ?? ''} onChange={(e) => set('mapLat', e.target.value === '' ? null : Number(e.target.value))} placeholder="-6.200000" />
        <TextField label="Longitude" required={!!form.isPublic} type="number" step="any" value={form.mapLng ?? ''} onChange={(e) => set('mapLng', e.target.value === '' ? null : Number(e.target.value))} placeholder="106.816666" />
        <TextField label="Jam Operasional" wrapClass="sm:col-span-2" value={form.businessHours ?? ''} onChange={(e) => set('businessHours', e.target.value)} placeholder="Senin–Sabtu, 09.00–17.00" />
        <TextField label="Urutan Publik" type="number" min="0" value={String(form.publicSortOrder ?? 0)} onChange={(e) => set('publicSortOrder', Number(e.target.value))} />
        <div className="sm:col-span-2"><label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Deskripsi Showroom</label><textarea value={form.publicDescription ?? ''} onChange={(e) => set('publicDescription', e.target.value)} rows={3} className="w-full px-3.5 py-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary resize-none" placeholder="Jelaskan area layanan, fasilitas, atau ciri lokasi showroom." /></div>
      </form>
    </Modal>
  );
};
