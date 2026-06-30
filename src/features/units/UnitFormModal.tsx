import { useState, type FormEvent } from 'react';
import { Car } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { useAppDispatch } from '@/app/store';
import { addUnit, updateUnit } from '@/app/store/dataSlice';
import type { Unit, FuelType, Transmission, UnitStatus } from '@/data/types';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { CashAccountSelect } from '@/features/finance/components';

interface UnitFormModalProps {
  open: boolean;
  onClose: () => void;
  unit?: Unit | null;
}

const emptyUnit = (): Omit<Unit, 'id'> => ({
  code: `CS-${String(Math.floor(1000 + Math.random() * 9000))}`,
  brand: '', model: '', variant: '', year: new Date().getFullYear(),
  price: 0, buyPrice: 0, km: 0, fuel: 'Bensin', transmission: 'AT',
  color: '', plate: '', status: 'ready', isNew: true, image: DEFAULT_CAR_IMAGE,
  cashAccountId: '', tanggalPembelian: new Date().toISOString().slice(0, 10), purchaseCashTransactionId: null,
});

export const UnitFormModal = ({ open, onClose, unit }: UnitFormModalProps) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<Omit<Unit, 'id'>>(unit ?? emptyUnit());

  // Re-seed form when the modal target changes.
  const [seedId, setSeedId] = useState<string | undefined>(unit?.id);
  if (open && unit?.id !== seedId) {
    setSeedId(unit?.id);
    setForm(unit ?? emptyUnit());
  }
  if (open && !unit && seedId !== undefined) {
    setSeedId(undefined);
    setForm(emptyUnit());
  }

  const set = <K extends keyof Omit<Unit, 'id'>>(key: K, value: Omit<Unit, 'id'>[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const purchaseLocked = !!unit?.purchaseCashTransactionId;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (unit) dispatch(updateUnit({ ...form, id: unit.id }));
    else dispatch(addUnit(form));
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Car size={20} />}
      title={unit ? 'Edit Unit' : 'Tambah Unit Baru'}
      subtitle={unit ? unit.code : 'Lengkapi data unit mobil'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" form="unit-form">{unit ? 'Simpan Perubahan' : 'Tambah Unit'}</Button>
        </>
      }
    >
      <form id="unit-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Merek" required value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Toyota" />
        <TextField label="Model" required value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Fortuner" />
        <TextField label="Varian" value={form.variant} onChange={(e) => set('variant', e.target.value)} placeholder="2.4 G AT" />
        <TextField label="Tahun" type="number" value={form.year} onChange={(e) => set('year', Number(e.target.value))} />
        <TextField label="Harga Jual (Rp)" type="number" value={form.price} onChange={(e) => set('price', Number(e.target.value))} />
        <TextField label="Harga Beli (Rp)" type="number" disabled={purchaseLocked} value={form.buyPrice ?? 0} onChange={(e) => set('buyPrice', Number(e.target.value))} />
        <TextField label="Tanggal Pembelian" type="date" disabled={purchaseLocked} value={form.tanggalPembelian ?? ''} onChange={(e) => set('tanggalPembelian', e.target.value)} />
        {!unit && <CashAccountSelect label="Akun Kas Pembelian" required value={form.cashAccountId ?? ''} onChange={(v) => set('cashAccountId', v)} />}
        <TextField label="Kilometer" type="number" value={form.km} onChange={(e) => set('km', Number(e.target.value))} />
        <TextField label="Warna" value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Hitam" />
        <SelectField
          label="Bahan Bakar"
          value={form.fuel}
          onChange={(e) => set('fuel', e.target.value as FuelType)}
          options={[{ value: 'Bensin', label: 'Bensin' }, { value: 'Diesel', label: 'Diesel' }, { value: 'Hybrid', label: 'Hybrid' }, { value: 'Listrik', label: 'Listrik' }]}
        />
        <SelectField
          label="Transmisi"
          value={form.transmission}
          onChange={(e) => set('transmission', e.target.value as Transmission)}
          options={[{ value: 'AT', label: 'Automatic (AT)' }, { value: 'MT', label: 'Manual (MT)' }, { value: 'CVT', label: 'CVT' }]}
        />
        <TextField label="Plat Nomor" value={form.plate} onChange={(e) => set('plate', e.target.value)} placeholder="B 1234 ABC" />
        <SelectField
          label="Status"
          value={form.status}
          onChange={(e) => set('status', e.target.value as UnitStatus)}
          options={[
            { value: 'ready', label: 'Ready' },
            { value: 'rekondisi', label: 'Rekondisi' },
            { value: 'booked', label: 'Booked' },
            { value: 'sold', label: 'Terjual' },
            { value: 'pembelian', label: 'Pembelian' },
          ]}
        />
        <TextField label="URL Foto" wrapClass="sm:col-span-2" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." />

        {form.status === 'rekondisi' && (
          <>
            <TextField label="Progress Rekondisi (%)" type="number" value={form.rekondisiProgress ?? 0} onChange={(e) => set('rekondisiProgress', Number(e.target.value))} />
            <TextField label="Estimasi Selesai" type="date" value={form.rekondisiEta ?? ''} onChange={(e) => set('rekondisiEta', e.target.value)} />
          </>
        )}

        <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={!!form.isNew} onChange={(e) => set('isNew', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" />
          <span className="text-[13px] font-semibold text-ink-soft">Tandai sebagai unit baru masuk (badge "BARU")</span>
        </label>
      </form>
    </Modal>
  );
};
