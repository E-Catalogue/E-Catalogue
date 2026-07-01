import { useState, type ChangeEvent, type FormEvent } from 'react';
import { KeyRound, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { leadApi } from '@/features/crm/crm.api';
import { SalesSelect } from '@/features/finance/components';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { useTestDriveMutations, useTestDriveUnits } from './testDrive.hooks';
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
  const [leadSearch, setLeadSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const debouncedLead = useDebouncedValue(leadSearch, 350);
  const debouncedUnit = useDebouncedValue(unitSearch, 350);
  const [fileError, setFileError] = useState('');
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ? toForm(item) : empty()); setFileError(''); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(empty()); setFileError(''); }

  const { data: leadsRes } = useQuery({
    queryKey: ['test-drive-leads', debouncedLead],
    queryFn: () => leadApi.list({ page: 1, limit: 20, search: debouncedLead }),
    enabled: open,
  });
  const { data: unitRes } = useTestDriveUnits({ search: debouncedUnit || undefined });
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

  const leadOptions = [{ value: '', label: 'Pilih lead/customer' }, ...((leadsRes?.data ?? []).map((l) => ({ value: l.id, label: `${l.nama}${l.noHp ? ` - ${l.noHp}` : ''}` })))];
  const unitOptions = [{ value: '', label: 'Pilih unit READY STOCK' }, ...((unitRes?.data ?? []).map((u) => ({ value: u.id, label: `${u.platNomor} - ${u.merekName} ${u.tipeName} ${u.tahun} - ${u.warna}` })))];

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
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted">Lead / Customer <span className="text-primary">*</span></label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} placeholder="Cari customer..." className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface-soft border border-border text-sm focus:outline-none focus:border-primary mb-1.5" />
          </div>
          <select required value={form.leadId} onChange={(e) => set('leadId', e.target.value)} className="w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold">
            {leadOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted">Unit Ready Stock <span className="text-primary">*</span></label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} placeholder="Cari plat / merek / tipe..." className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface-soft border border-border text-sm focus:outline-none focus:border-primary mb-1.5" />
          </div>
          <select required value={form.unitId} onChange={(e) => set('unitId', e.target.value)} className="w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold">
            {unitOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <SalesSelect label="Sales (opsional)" value={form.salesId} onChange={(value) => set('salesId', value)} />
        <SelectField label="Status" value={form.status} onChange={(e) => set('status', e.target.value as TestDriveStatus)} options={[{ value: 'SCHEDULED', label: 'Dijadwalkan' }, { value: 'COMPLETED', label: 'Selesai' }, { value: 'CANCELLED', label: 'Dibatalkan' }]} />
        <TextField label="Tanggal" required type="date" value={form.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)} />
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
