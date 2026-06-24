import { useState, type FormEvent } from 'react';
import { Wallet } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { useAppDispatch } from '@/app/store';
import { addExpense, updateExpense } from '@/app/store/dataSlice';
import type { Expense, ExpenseCategory } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Expense | null;
}

const CATEGORIES: ExpenseCategory[] = ['Investor', 'Operasional Showroom', 'Operasional Kendaraan', 'Lainnya'];

const empty = (): Omit<Expense, 'id'> => ({
  category: 'Operasional Showroom', name: '', amount: 0, date: new Date().toISOString().slice(0, 10), note: '',
});

export const ExpenseFormModal = ({ open, onClose, item }: Props) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<Omit<Expense, 'id'>>(item ?? empty());
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ?? empty()); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(empty()); }

  const set = <K extends keyof Omit<Expense, 'id'>>(k: K, v: Omit<Expense, 'id'>[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (item) dispatch(updateExpense({ ...form, id: item.id }));
    else dispatch(addExpense(form));
    onClose();
  };

  return (
    <Modal
      open={open} onClose={onClose} icon={<Wallet size={20} />}
      title={item ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="exp-form">{item ? 'Simpan' : 'Catat'}</Button></>}
    >
      <form id="exp-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Kategori" wrapClass="sm:col-span-2" value={form.category} onChange={(e) => set('category', e.target.value as ExpenseCategory)}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
        <TextField label="Nama / Keterangan" required wrapClass="sm:col-span-2" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="mis. Gaji Karyawan" />
        <TextField label="Nominal (Rp)" type="number" value={form.amount} onChange={(e) => set('amount', Number(e.target.value))} />
        <TextField label="Tanggal" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        <TextField label="Catatan" wrapClass="sm:col-span-2" value={form.note ?? ''} onChange={(e) => set('note', e.target.value)} placeholder="Opsional" />
      </form>
    </Modal>
  );
};
