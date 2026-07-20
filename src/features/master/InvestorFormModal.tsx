import { useState, type FormEvent } from 'react';
import { Landmark } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField, NumericField } from '@/shared/components/ui/Field';
import { INVESTOR_SCHEME_LABEL, type Investor, type InvestorScheme } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Investor | null;
  submitting?: boolean;
  onSubmit: (values: Partial<Investor>) => void;
}

const SCHEME_OPTIONS = (Object.keys(INVESTOR_SCHEME_LABEL) as InvestorScheme[]).map((v) => ({ value: v, label: INVESTOR_SCHEME_LABEL[v] }));

// scheme & defaultRate wajib diisi backend saat create (Joi `.required()`) — beri default aman
// alih-alih string kosong supaya SelectField selalu punya pilihan valid.
const empty = (): Partial<Investor> => ({
  name: '', code: '', bankName: '', bankAccount: '', bankAccountName: '',
  scheme: 'FIXED_MONTHLY', defaultRate: 0, isActive: true,
});

export const InvestorFormModal = ({ open, onClose, item, submitting, onSubmit }: Props) => {
  const [form, setForm] = useState<Partial<Investor>>(item ?? empty());
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ?? empty()); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(empty()); }

  const set = (k: keyof Investor, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      name: (form.name ?? '').trim(),
      code: (form.code ?? '').trim().toUpperCase(),
      bankName: (form.bankName ?? '').trim(),
      bankAccount: (form.bankAccount ?? '').trim(),
      bankAccountName: (form.bankAccountName ?? '').trim(),
    });
  };

  return (
    <Modal
      open={open} onClose={onClose} icon={<Landmark size={20} />}
      title={item ? 'Edit Investor' : 'Tambah Investor'}
      subtitle="Data investor & rekening untuk bagi hasil"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="investor-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}
    >
      <form id="investor-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nama Investor" required value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="mis. Budi Santoso" />
        <TextField label="Kode" required value={form.code ?? ''} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="mis. INV-001" />
        <SelectField
          label="Skema"
          required
          value={form.scheme ?? 'FIXED_MONTHLY'}
          onChange={(e) => set('scheme', e.target.value as InvestorScheme)}
          options={SCHEME_OPTIONS}
        />
        <NumericField
          label="Rate Default (%)"
          required
          value={form.defaultRate ?? 0}
          onChange={(v) => set('defaultRate', v)}
          suffix="%"
          decimal
          min={0}
          max={100}
          placeholder="mis. 2.5"
        />
        <TextField label="Nama Bank" required value={form.bankName ?? ''} onChange={(e) => set('bankName', e.target.value)} placeholder="mis. BCA" />
        <TextField label="No. Rekening" required value={form.bankAccount ?? ''} onChange={(e) => set('bankAccount', e.target.value)} placeholder="1234567890" />
        <TextField label="Atas Nama Rekening" required wrapClass="sm:col-span-2" value={form.bankAccountName ?? ''} onChange={(e) => set('bankAccountName', e.target.value)} placeholder="BUDI SANTOSO" />
        <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" />
          <span className="text-[13px] font-semibold text-ink-soft">Aktif</span>
        </label>
      </form>
    </Modal>
  );
};
