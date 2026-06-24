import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { addTestDrive, updateTestDrive } from '@/app/store/dataSlice';
import type { TestDrive } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: TestDrive | null;
}

const empty = (): Omit<TestDrive, 'id'> => ({
  customer: '', unit: '', date: new Date().toISOString().slice(0, 10), time: '10:00', status: 'Terjadwal',
});

export const TestDriveFormModal = ({ open, onClose, item }: Props) => {
  const dispatch = useAppDispatch();
  const units = useAppSelector((s) => s.data.units);
  const [form, setForm] = useState<Omit<TestDrive, 'id'>>(item ?? empty());
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ?? empty()); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(empty()); }

  const set = <K extends keyof Omit<TestDrive, 'id'>>(k: K, v: Omit<TestDrive, 'id'>[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (item) dispatch(updateTestDrive({ ...form, id: item.id }));
    else dispatch(addTestDrive(form));
    onClose();
  };

  const unitOptions = [{ value: '', label: '— Pilih unit —' }, ...units.map((u) => ({ value: `${u.brand} ${u.model} ${u.variant}`, label: `${u.brand} ${u.model} ${u.variant}` }))];

  return (
    <Modal
      open={open} onClose={onClose} icon={<KeyRound size={20} />}
      title={item ? 'Edit Jadwal Test Drive' : 'Jadwalkan Test Drive'}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="td-form">{item ? 'Simpan' : 'Jadwalkan'}</Button></>}
    >
      <form id="td-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Pelanggan" required wrapClass="sm:col-span-2" value={form.customer} onChange={(e) => set('customer', e.target.value)} placeholder="Nama pelanggan" />
        <SelectField label="Unit" wrapClass="sm:col-span-2" value={form.unit} onChange={(e) => set('unit', e.target.value)} options={unitOptions} />
        <TextField label="Tanggal" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        <TextField label="Jam" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
        <SelectField label="Status" wrapClass="sm:col-span-2" value={form.status} onChange={(e) => set('status', e.target.value as TestDrive['status'])}
          options={[{ value: 'Terjadwal', label: 'Terjadwal' }, { value: 'Selesai', label: 'Selesai' }, { value: 'Batal', label: 'Batal' }]} />
      </form>
    </Modal>
  );
};
