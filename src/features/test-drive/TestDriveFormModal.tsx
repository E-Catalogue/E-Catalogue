import { useState, type ChangeEvent, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { DateField } from '@/shared/components/ui/DateField';
import { notifyApiError } from '@/core/api/notify';
import { useTestDriveMutations, useTestDriveLookups } from './testDrive.hooks';
import { unitOptionLabel } from '@/features/units/unit.display';
import type { TestDrive, TestDriveStatus } from './testDrive.types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: TestDrive | null;
}

interface FormState {
  leadId: string;
  unitId: string;
  salesId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: TestDriveStatus;
  catatan: string;
  fotoKtp: File | null;
  fotoSim: File | null;
}

const empty = (): FormState => ({
  leadId: '',
  unitId: '',
  salesId: '',
  scheduledDate: new Date().toISOString().slice(0, 10),
  scheduledTime: '10:00',
  status: 'SCHEDULED',
  catatan: '',
  fotoKtp: null,
  fotoSim: null,
});

const toForm = (item: TestDrive): FormState => ({
  leadId: item.leadId,
  unitId: item.unitId,
  salesId: item.salesId ?? '',
  scheduledDate: item.scheduledAt.slice(0, 10),
  scheduledTime: item.scheduledAt.slice(11, 16),
  status: item.status,
  catatan: item.catatan ?? '',
  fotoKtp: null,
  fotoSim: null,
});

const validateImage = (file: File | null) => {
  if (!file) return null;
  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) return 'File harus JPG, JPEG, atau PNG.';
  if (file.size > 5 * 1024 * 1024) return 'Ukuran file maksimal 5MB.';
  return null;
};

export const TestDriveFormModal = ({ open, onClose, item }: Props) => {
  const [form, setForm] = useState<FormState>(item ? toForm(item) : empty());
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  const [fileError, setFileError] = useState('');
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ? toForm(item) : empty()); setFileError(''); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(empty()); setFileError(''); }

  const { data: lookup, isLoading: lookupLoading } = useTestDriveLookups(open);
  const mutations = useTestDriveMutations();
  const pending = mutations.create.isPending || mutations.update.isPending;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const fileChange = (key: 'fotoKtp' | 'fotoSim') => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    const err = validateImage(file);
    setFileError(err ?? '');
    if (!err) set(key, file);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!item && !form.fotoKtp) { setFileError('Foto KTP wajib diunggah.'); return; }
    if (!item && !form.fotoSim) { setFileError('Foto SIM wajib diunggah.'); return; }
    const ktpError = validateImage(form.fotoKtp);
    const simError = validateImage(form.fotoSim);
    if (ktpError || simError) { setFileError(ktpError || simError || ''); return; }

    const body = new FormData();
    if (form.leadId) body.append('leadId', form.leadId);
    if (form.unitId) body.append('unitId', form.unitId);
    if (form.salesId) body.append('salesId', form.salesId);
    body.append('scheduledAt', new Date(`${form.scheduledDate}T${form.scheduledTime}`).toISOString());
    body.append('status', form.status);
    body.append('catatan', form.catatan || '');
    if (form.fotoKtp) body.append('fotoKtp', form.fotoKtp);
    if (form.fotoSim) body.append('fotoSim', form.fotoSim);

    const opts = { onError: (err: unknown) => notifyApiError(err), onSuccess: () => onClose() };
    if (item) mutations.update.mutate({ id: item.id, body }, opts);
    else mutations.create.mutate(body, opts);
  };

  const leadOptions = (lookup?.leads ?? []).map((l) => ({ value: l.id, label: l.nama, sublabel: l.nik || undefined }));
  const unitOptions = (lookup?.units ?? []).map((u) => ({ value: u.id, label: unitOptionLabel(u), sublabel: `${[u.merek?.name, u.tipe?.name].filter(Boolean).join(' ')} · ${u.tahun} · ${u.warna}` }));
  const salesOptions = (lookup?.sales ?? []).map((s) => ({ value: s.id, label: s.name, sublabel: s.username || undefined }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<KeyRound size={20} />}
      title={item ? 'Edit Jadwal Test Drive' : 'Jadwalkan Test Drive'}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="td-form" disabled={pending}>{item ? 'Simpan' : 'Jadwalkan'}</Button></>}
    >
      <form id="td-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SearchableSelect label="Lead / Customer" required wrapClass="sm:col-span-2" value={form.leadId} onChange={(v) => set('leadId', v)} options={leadOptions} loading={lookupLoading} placeholder="Pilih lead" searchPlaceholder="Cari customer / NIK..." emptyMessage="Tidak ada lead aktif." />
        <SearchableSelect label="Unit Ready Stock" required wrapClass="sm:col-span-2" value={form.unitId} onChange={(v) => set('unitId', v)} options={unitOptions} loading={lookupLoading} placeholder="Pilih unit" searchPlaceholder="Cari plat / merek / tipe..." emptyMessage="Tidak ada unit ready stock." />
        <SearchableSelect label="Sales (opsional)" value={form.salesId} onChange={(v) => set('salesId', v)} options={salesOptions} loading={lookupLoading} clearable placeholder="Pilih sales" searchPlaceholder="Cari sales..." />
        <SelectField label="Status" value={form.status} onChange={(e) => set('status', e.target.value as TestDriveStatus)} options={[{ value: 'SCHEDULED', label: 'Dijadwalkan' }, { value: 'COMPLETED', label: 'Selesai' }, { value: 'CANCELLED', label: 'Dibatalkan' }]} />
        <DateField label="Tanggal" required value={form.scheduledDate} onChange={(v) => set('scheduledDate', v)} />
        <TextField label="Jam" required type="time" value={form.scheduledTime} onChange={(e) => set('scheduledTime', e.target.value)} />
        <TextField label="Foto KTP" required={!item} type="file" accept="image/jpeg,image/jpg,image/png" onChange={fileChange('fotoKtp')} />
        <TextField label="Foto SIM" required={!item} type="file" accept="image/jpeg,image/jpg,image/png" onChange={fileChange('fotoSim')} />
        {fileError && <p className="sm:col-span-2 text-[12px] font-semibold text-semantic-error">{fileError}</p>}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Catatan</label>
          <textarea value={form.catatan} onChange={(e) => set('catatan', e.target.value)} rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary resize-none" />
        </div>
      </form>
    </Modal>
  );
};
