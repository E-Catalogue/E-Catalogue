import { useState, type FormEvent } from 'react';
import { UserPlus } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { useLeadSourceLookup } from './crm.hooks';
import type { Lead } from './crm.types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Lead | null;
  submitting?: boolean;
  onSubmit: (values: Partial<Lead>) => void;
}

const empty = (): Partial<Lead> => ({ nama: '', nik: '', noHp: '', email: '', alamat: '', pekerjaan: '', sumberLeadId: '' });

export const LeadFormModal = ({ open, onClose, item, submitting, onSubmit }: Props) => {
  const [form, setForm] = useState<Partial<Lead>>(item ?? empty());
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ?? empty()); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(empty()); }

  const { data: sources = [], isLoading: sourcesLoading } = useLeadSourceLookup(open);
  const sumberOptions = sources.map((s) => ({ value: s.id, label: s.name, sublabel: s.code || undefined }));

  const set = (k: keyof Lead, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      nama: (form.nama ?? '').trim(),
      nik: form.nik?.trim() || undefined,
      noHp: form.noHp?.trim() || undefined,
      email: form.email?.trim() || undefined,
      alamat: form.alamat?.trim() || undefined,
      pekerjaan: form.pekerjaan?.trim() || undefined,
      sumberLeadId: form.sumberLeadId || undefined,
    });
  };

  return (
    <Modal
      open={open} onClose={onClose} icon={<UserPlus size={20} />}
      title={item ? 'Edit Lead' : 'Tambah Lead'}
      subtitle="Data customer / prospek penjualan"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="lead-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}
    >
      <form id="lead-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nama" required wrapClass="sm:col-span-2" value={form.nama ?? ''} onChange={(e) => set('nama', e.target.value)} placeholder="Nama lengkap customer" />
        <TextField label="NIK" value={form.nik ?? ''} onChange={(e) => set('nik', e.target.value)} placeholder="16 digit NIK KTP" maxLength={16} />
        <TextField label="No. HP" value={form.noHp ?? ''} onChange={(e) => set('noHp', e.target.value)} placeholder="08xx-xxxx-xxxx" />
        <TextField label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="email@contoh.com" />
        <TextField label="Pekerjaan" value={form.pekerjaan ?? ''} onChange={(e) => set('pekerjaan', e.target.value)} placeholder="mis. Karyawan Swasta" />
        <TextField label="Alamat" wrapClass="sm:col-span-2" value={form.alamat ?? ''} onChange={(e) => set('alamat', e.target.value)} placeholder="Alamat lengkap" />
        <SearchableSelect label="Sumber Lead" wrapClass="sm:col-span-2" value={form.sumberLeadId ?? ''} onChange={(v) => set('sumberLeadId', v)} options={sumberOptions} loading={sourcesLoading} clearable placeholder="Pilih sumber lead" searchPlaceholder="Cari sumber..." />
      </form>
    </Modal>
  );
};
