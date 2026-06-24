import { useState, type FormEvent } from 'react';
import { Users } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { useAppDispatch } from '@/app/store';
import { addLead, updateLead } from '@/app/store/dataSlice';
import type { Lead, LeadSource, LeadStage } from '@/data/types';

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

const empty = (): Omit<Lead, 'id'> => ({
  name: '', phone: '', source: 'Instagram', interestedUnit: '', stage: 'lead',
  budget: 0, createdAt: new Date().toISOString().slice(0, 10), followUpAt: '',
});

export const LeadFormModal = ({ open, onClose, lead }: LeadFormModalProps) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<Omit<Lead, 'id'>>(lead ?? empty());
  const [seedId, setSeedId] = useState<string | undefined>(lead?.id);
  if (open && lead?.id !== seedId) { setSeedId(lead?.id); setForm(lead ?? empty()); }
  if (open && !lead && seedId !== undefined) { setSeedId(undefined); setForm(empty()); }

  const set = <K extends keyof Omit<Lead, 'id'>>(k: K, v: Omit<Lead, 'id'>[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (lead) dispatch(updateLead({ ...form, id: lead.id }));
    else dispatch(addLead(form));
    onClose();
  };

  return (
    <Modal
      open={open} onClose={onClose} icon={<Users size={20} />}
      title={lead ? 'Edit Lead' : 'Tambah Lead Baru'}
      subtitle={lead ? lead.name : 'Catat prospek pelanggan'}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="lead-form">{lead ? 'Simpan' : 'Tambah Lead'}</Button></>}
    >
      <form id="lead-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nama" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nama pelanggan" />
        <TextField label="No. Telepon" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0812-xxxx-xxxx" />
        <TextField label="Unit Diminati" wrapClass="sm:col-span-2" value={form.interestedUnit} onChange={(e) => set('interestedUnit', e.target.value)} placeholder="Toyota Fortuner 2.4 G" />
        <SelectField label="Sumber" value={form.source} onChange={(e) => set('source', e.target.value as LeadSource)}
          options={['Instagram', 'Facebook', 'Walk-in', 'Referral', 'OLX', 'Website'].map((s) => ({ value: s, label: s }))} />
        <SelectField label="Tahap" value={form.stage} onChange={(e) => set('stage', e.target.value as LeadStage)}
          options={[{ value: 'lead', label: 'Lead / Prospek' }, { value: 'test_drive', label: 'Test Drive' }, { value: 'negosiasi', label: 'Negosiasi' }, { value: 'spk', label: 'SPK / Deal' }]} />
        <TextField label="Budget (Rp)" type="number" value={form.budget} onChange={(e) => set('budget', Number(e.target.value))} />
        <TextField label="Follow Up" type="date" value={form.followUpAt ?? ''} onChange={(e) => set('followUpAt', e.target.value)} />
      </form>
    </Modal>
  );
};
