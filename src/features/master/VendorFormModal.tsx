import { useState, type FormEvent } from 'react';
import { Store } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import type { Vendor, VendorCreateInput } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Vendor | null;
  submitting?: boolean;
  codeError?: string | null;
  onClearCodeError?: () => void;
  onSubmit: (values: VendorCreateInput) => void;
}

const empty = (): VendorCreateInput => ({ code: '', name: '', address: '', phone: '', isActive: true });

export const VendorFormModal = ({
  open, onClose, item, submitting = false, codeError, onClearCodeError, onSubmit,
}: Props) => {
  const [form, setForm] = useState<VendorCreateInput>(() => item ? {
    code: item.code,
    name: item.name,
    address: item.address ?? '',
    phone: item.phone ?? '',
    isActive: item.isActive,
  } : empty());
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof VendorCreateInput>(key: K, value: VendorCreateInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === 'code') onClearCodeError?.();
  };
  const codeValid = form.code.trim().length >= 2;
  const nameValid = form.name.trim().length >= 2;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!codeValid || !nameValid || submitting) return;
    onSubmit({
      ...form,
      code: form.code.trim(),
      name: form.name.trim(),
      address: form.address?.trim() || null,
      phone: form.phone?.trim() || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      icon={<Store size={20} />}
      title={item ? 'Edit Vendor' : 'Tambah Vendor'}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Batal</Button>
          <Button type="submit" form="vendor-form" loading={submitting}>Simpan</Button>
        </>
      )}
    >
      <form id="vendor-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <TextField label="Code Vendor" required value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="mis. VND-001" />
          {(codeError || (submitted && !codeValid)) && (
            <p className="text-[11px] font-semibold text-semantic-error mt-1">{codeError ?? 'Code vendor minimal 2 karakter.'}</p>
          )}
        </div>
        <div>
          <TextField label="Nama Vendor" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="mis. Bengkel HD Argo" />
          {submitted && !nameValid && <p className="text-[11px] font-semibold text-semantic-error mt-1">Nama vendor minimal 2 karakter.</p>}
        </div>
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
