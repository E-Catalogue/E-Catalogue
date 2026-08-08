import { useState, type FormEvent } from 'react';
import { Building2 } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { useBranchPicLookup } from './master.hooks';
import type { Branch, BranchOperatingHour } from './types';
import { BranchLocationPicker } from './BranchLocationPicker';
import { BranchOperatingHoursEditor } from './BranchOperatingHoursEditor';
import { defaultOperatingHours } from './branchHours';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Branch | null;
  submitting?: boolean;
  onSubmit: (values: Partial<Branch>) => void;
}

const empty = (): Partial<Branch> => ({ nama: '', code: '', picId: '', lokasi: '', phone: '', whatsappNumber: '', isMain: false, isPublic: false, publicSortOrder: 0, publicDescription: '', operatingHours: defaultOperatingHours(), mapLat: null, mapLng: null });
const normalizePhone = (value?: string | null) => {
  const digits = (value ?? '').replace(/\D/g, '');
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
};
const seed = (item?: Branch | null): Partial<Branch> => {
  if (!item) return empty();
  const defaults = defaultOperatingHours();
  const incoming = item.operatingHours ?? [];
  return { ...empty(), ...item, phone: item.phone || item.kontak || '', operatingHours: defaults.map((day) => incoming.find((entry) => entry.day === day.day) ?? day) };
};

export const BranchFormModal = ({ open, onClose, item, submitting, onSubmit }: Props) => {
  const [form, setForm] = useState<Partial<Branch>>(() => seed(item));

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
      phone: normalizePhone(form.phone),
      whatsappNumber: normalizePhone(form.whatsappNumber) || null,
      operatingHours: form.operatingHours ?? defaultOperatingHours(),
      isMain: !!form.isMain,
      isPublic: !!form.isPublic,
      publicSortOrder: Number(form.publicSortOrder ?? 0),
      publicDescription: (form.publicDescription ?? '').trim() || null,
      mapLat: form.mapLat == null || form.mapLat === ('' as unknown as number) ? null : Number(form.mapLat),
      mapLng: form.mapLng == null || form.mapLng === ('' as unknown as number) ? null : Number(form.mapLng),
    });
  };

  return (
    <Modal
      open={open} onClose={onClose} icon={<Building2 size={20} />}
      title={item ? 'Edit Cabang' : 'Tambah Cabang'}
      size="xl"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="branch-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}
    >
      <form id="branch-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nama Cabang" required value={form.nama ?? ''} onChange={(e) => set('nama', e.target.value)} placeholder="Kantor Pusat" />
        <TextField label="Kode" required value={form.code ?? ''} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="KP-01" />
        <SearchableSelect label="PIC (Penanggung Jawab)" required wrapClass="sm:col-span-2" value={form.picId ?? ''} onChange={(v) => set('picId', v)} options={picOptions} loading={picsLoading} placeholder="Pilih PIC" searchPlaceholder="Cari user..." emptyMessage="Tidak ada user aktif." />
        <TextField label="Alamat Lengkap" required wrapClass="sm:col-span-2" value={form.lokasi ?? ''} onChange={(e) => set('lokasi', e.target.value)} placeholder="Jl. Contoh No. 1, Jakarta Selatan" />
        <TextField label="Nomor Telepon" required value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))} placeholder="6238957238957" />
        <TextField label="Nomor WhatsApp" required value={form.whatsappNumber ?? ''} onChange={(e) => set('whatsappNumber', e.target.value.replace(/\D/g, ''))} placeholder="6281234567890" />
        <p className="sm:col-span-2 -mt-2 text-[11px] font-medium text-muted">Gunakan format internasional tanpa tanda +, spasi, atau strip. Nomor yang diawali 0 akan otomatis diubah menjadi 62 saat disimpan.</p>
        <div className="sm:col-span-2 border-t border-border pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-soft/50 p-3.5">
            <input type="checkbox" checked={!!form.isMain} onChange={(e) => setForm((current) => ({ ...current, isMain: e.target.checked, isPublic: e.target.checked ? true : current.isPublic }))} className="mt-0.5 w-4 h-4 accent-primary" />
            <span><span className="block text-sm font-bold text-ink">Tetapkan sebagai cabang utama</span><span className="block text-[11px] text-muted mt-0.5">Menjadi sumber kontak, alamat, dan jam operasional utama website.</span></span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-soft/50 p-3.5">
            <input type="checkbox" disabled={!!form.isMain} checked={!!form.isPublic || !!form.isMain} onChange={(e) => set('isPublic', e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary disabled:cursor-not-allowed" />
            <span><span className="block text-sm font-bold text-ink">Tampilkan sebagai lokasi showroom publik</span><span className="block text-[11px] text-muted mt-0.5">Cabang akan muncul di beranda, kontak, dan peta publik.</span></span>
          </label>
          </div>
          {form.isMain && <p className="mt-2 text-[11px] font-semibold text-primary">Cabang utama otomatis ditayangkan sebagai lokasi publik. Menyimpan pilihan ini akan menggantikan cabang utama sebelumnya.</p>}
        </div>
        <div className="sm:col-span-2"><BranchOperatingHoursEditor value={(form.operatingHours ?? defaultOperatingHours()) as BranchOperatingHour[]} onChange={(hours) => set('operatingHours', hours)} /></div>
        <div className="sm:col-span-2 rounded-xl border border-primary/15 bg-primary-light/40 px-3.5 py-3 text-[11px] font-medium leading-5 text-ink-soft">Gunakan koordinat dari Google Maps atau pilih langsung pada peta. Latitude berada pada rentang -90 sampai 90, sedangkan longitude -180 sampai 180.</div>
        <TextField label="Latitude" required type="number" step="any" value={form.mapLat ?? ''} onChange={(e) => set('mapLat', e.target.value === '' ? null : Number(e.target.value))} placeholder="-6.200000" />
        <TextField label="Longitude" required type="number" step="any" value={form.mapLng ?? ''} onChange={(e) => set('mapLng', e.target.value === '' ? null : Number(e.target.value))} placeholder="106.816666" />
        <div className="sm:col-span-2"><BranchLocationPicker latitude={form.mapLat ?? null} longitude={form.mapLng ?? null} onChange={(latitude, longitude) => setForm((current) => ({ ...current, mapLat: latitude, mapLng: longitude }))} /></div>
        <TextField label="Urutan Publik" type="number" min="0" value={String(form.publicSortOrder ?? 0)} onChange={(e) => set('publicSortOrder', Number(e.target.value))} />
        <div className="sm:col-span-2"><label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Deskripsi Showroom</label><textarea value={form.publicDescription ?? ''} onChange={(e) => set('publicDescription', e.target.value)} rows={3} className="w-full px-3.5 py-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary resize-none" placeholder="Jelaskan area layanan, fasilitas, atau ciri lokasi showroom." /></div>
      </form>
    </Modal>
  );
};
