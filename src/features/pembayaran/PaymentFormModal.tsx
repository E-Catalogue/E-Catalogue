import { useState, type FormEvent } from 'react';
import { Wallet } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { useAppDispatch } from '@/app/store';
import { addPayment, updatePayment } from '@/app/store/dataSlice';
import type { Payment } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Payment | null;
}

const empty = (): Omit<Payment, 'id'> => ({
  invoice: '', customer: '', method: 'Transfer BCA', amount: 0,
  date: new Date().toISOString().slice(0, 10), status: 'Sukses',
});

export const PaymentFormModal = ({ open, onClose, item }: Props) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<Omit<Payment, 'id'>>(item ?? empty());
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ?? empty()); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(empty()); }

  const set = <K extends keyof Omit<Payment, 'id'>>(k: K, v: Omit<Payment, 'id'>[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (item) dispatch(updatePayment({ ...form, id: item.id }));
    else dispatch(addPayment(form));
    onClose();
  };

  return (
    <Modal
      open={open} onClose={onClose} icon={<Wallet size={20} />}
      title={item ? 'Edit Pembayaran' : 'Catat Pembayaran'}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="pay-form">{item ? 'Simpan' : 'Catat'}</Button></>}
    >
      <form id="pay-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Invoice" required value={form.invoice} onChange={(e) => set('invoice', e.target.value)} placeholder="INV-2405-001" />
        <TextField label="Pelanggan" value={form.customer} onChange={(e) => set('customer', e.target.value)} placeholder="Nama pembayar" />
        <SelectField label="Metode" value={form.method} onChange={(e) => set('method', e.target.value)}
          options={['Transfer BCA', 'Transfer Mandiri', 'Cash', 'QRIS', 'Kartu Kredit', 'Leasing'].map((m) => ({ value: m, label: m }))} />
        <TextField label="Jumlah (Rp)" type="number" value={form.amount} onChange={(e) => set('amount', Number(e.target.value))} />
        <TextField label="Tanggal" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        <SelectField label="Status" value={form.status} onChange={(e) => set('status', e.target.value as Payment['status'])}
          options={[{ value: 'Sukses', label: 'Sukses' }, { value: 'Pending', label: 'Pending' }, { value: 'Gagal', label: 'Gagal' }]} />
      </form>
    </Modal>
  );
};
