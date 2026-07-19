import { useState, type FormEvent } from 'react';
import { ReceiptText } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { addSale, updateSale } from '@/app/store/dataSlice';
import type { Sale } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Sale | null;
}

const genInvoice = () => {
  const d = new Date();
  return `INV-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`;
};

const empty = (): Omit<Sale, 'id'> => ({
  invoice: genInvoice(), customer: '', unit: '', date: new Date().toISOString().slice(0, 10),
  total: 0, paymentType: 'Cash', status: 'Proses',
});

export const SaleFormModal = ({ open, onClose, item }: Props) => {
  const dispatch = useAppDispatch();
  const units = useAppSelector((s) => s.data.units);
  const [form, setForm] = useState<Omit<Sale, 'id'>>(item ?? empty());
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ?? empty()); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(empty()); }

  const set = <K extends keyof Omit<Sale, 'id'>>(k: K, v: Omit<Sale, 'id'>[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (item) dispatch(updateSale({ ...form, id: item.id }));
    else dispatch(addSale(form));
    onClose();
  };

  const unitOptions = [{ value: '', label: '— Pilih unit —' }, ...units.map((u) => ({ value: `${u.brand} ${u.model} ${u.variant}`, label: `${u.brand} ${u.model} ${u.variant}` }))];

  return (
    <Modal
      open={open} onClose={onClose} icon={<ReceiptText size={20} />}
      title={item ? 'Edit Penjualan' : 'Buat Penjualan'}
      subtitle={form.invoice}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="sale-form">{item ? 'Simpan' : 'Buat'}</Button></>}
    >
      <form id="sale-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Pelanggan" required value={form.customer} onChange={(e) => set('customer', e.target.value)} placeholder="Nama pembeli" />
        <TextField label="Tanggal" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        <SelectField label="Unit" wrapClass="sm:col-span-2" value={form.unit} onChange={(e) => set('unit', e.target.value)} options={unitOptions} />
        <TextField label="Total (Rp)" type="number" value={form.total} onChange={(e) => set('total', Number(e.target.value))} />
        <SelectField label="Tipe Bayar" value={form.paymentType} onChange={(e) => set('paymentType', e.target.value as Sale['paymentType'])}
          options={[{ value: 'Cash', label: 'Cash' }, { value: 'Kredit', label: 'Kredit' }]} />
        <SelectField label="Status" wrapClass="sm:col-span-2" value={form.status} onChange={(e) => set('status', e.target.value as Sale['status'])}
          options={[{ value: 'Lunas', label: 'Lunas' }, { value: 'DP', label: 'DP' }, { value: 'Proses', label: 'Proses' }]} />
      </form>
    </Modal>
  );
};
