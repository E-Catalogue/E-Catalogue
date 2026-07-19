import { useState, type FormEvent } from 'react';
import { Store } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import type { Vendor } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Vendor | null;
  submitting?: boolean;
  onSubmit: (values: Partial<Vendor>) => void;
}

const empty = (): Partial<Vendor> => ({ name: '', address: '', phone: '', isActive: true });

export const VendorFormModal = ({ open, onClose, item, submitting, onSubmit }: Props) => {
  const [form, setForm] = useState<Partial<Vendor>>(item ?? empty());
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ?? empty()); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(empty()); }

  const set = (k: keyof Vendor, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit({ ...form, name: (form.name ?? '').trim() }); };

  return (
    <Modal
      open={open} onClose={onClose} icon={<Store size={20} />}
      title={item ? 'Edit Vendor' : 'Tambah Vendor'}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="vendor-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}
    >
      <form id="vendor-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nama Vendor" required wrapClass="sm:col-span-2" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="mis. Bengkel HD Argo" />
        <TextField label="Telepon" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="0812-xxxx-xxxx" />
        <TextField label="Alamat" value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} placeholder="Alamat vendor" />
        <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" />
          <span className="text-[13px] font-semibold text-ink-soft">Aktif</span>
        </label>
      </form>
    </Modal>
  );
};
