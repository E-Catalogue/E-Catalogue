import { useState, type FormEvent, useEffect } from 'react';
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
  const [form, setForm] = useState<UnitFormData>(emptyUnitForm());

  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  const set = <K extends keyof Omit<Unit, 'id'>>(key: K, value: Omit<Unit, 'id'>[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const purchaseLocked = !!unit?.purchaseCashTransactionId;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (unit) {
      updateUnit.mutate({ id: unit.id, data: form }, { onSuccess: onClose });
    } else {
      createUnit.mutate(form, { onSuccess: onClose });
    }
  };

  const isPending = createUnit.isPending || updateUnit.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Car size={20} />}
      title={unit ? 'Edit Unit' : 'Tambah Unit Baru'}
      subtitle={unit ? unit.platNomor : 'Lengkapi data unit mobil'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>Batal</Button>
          <Button type="submit" form="unit-form" disabled={isPending}>
            {unit ? 'Simpan Perubahan' : 'Tambah Unit'}
          </Button>
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
          label="Merek"
          required
          value={form.merekId}
          onChange={(e) => set('merekId', e.target.value)}
          options={[{ value: '', label: 'Pilih Merek' }, ...mereks.map(m => ({ value: m.id, label: m.name }))]}
        />
        <SelectField
          label="Tipe / Model"
          required
          value={form.tipeId}
          onChange={(e) => set('tipeId', e.target.value)}
          options={[{ value: '', label: form.merekId ? 'Pilih Tipe' : 'Pilih Merek dahulu' }, ...tipes.map(t => ({ value: t.id, label: t.name }))]}
          disabled={!form.merekId}
        />

        <NumericField
          label="Tahun"
          required
          value={form.tahun}
          onChange={(v) => set('tahun', v)}
          placeholder={String(new Date().getFullYear())}
          min={1980}
          max={new Date().getFullYear() + 1}
        />
        <TextField
          label="Warna"
          required
          value={form.warna}
          onChange={(e) => set('warna', e.target.value)}
          placeholder="mis. Hitam Metalik"
        />

        <SelectField
          label="Transmisi"
          value={form.transmisi}
          onChange={(e) => set('transmisi', e.target.value as Transmisi)}
          options={[
            { value: 'AUTOMATIC', label: 'Automatic (AT)' },
            { value: 'MANUAL', label: 'Manual (MT)' },
          ]}
        />
        <NumericField
          label="Kilometer"
          required
          value={form.kilometer}
          onChange={(v) => set('kilometer', v)}
          suffix="km"
          placeholder="0"
          min={0}
        />

        <TextField
          label="Plat Nomor"
          required
          value={form.platNomor}
          onChange={(e) => set('platNomor', e.target.value)}
          placeholder="B 1234 ABC"
        />
        <TextField
          label="Tanggal Pajak"
          required
          type="date"
          value={form.tanggalPajak}
          onChange={(e) => set('tanggalPajak', e.target.value)}
        />

        <TextField
          label="No Rangka"
          required
          value={form.noRangka}
          onChange={(e) => set('noRangka', e.target.value)}
        />
        <TextField
          label="No Mesin"
          required
          value={form.noMesin}
          onChange={(e) => set('noMesin', e.target.value)}
        />

        <NumericField
          label="Harga Beli"
          required
          value={form.hargaBeli}
          onChange={(v) => set('hargaBeli', v)}
          prefix="Rp"
          placeholder="0"
          min={0}
        />
        <TextField
          label="Tanggal Pembelian"
          required
          type="date"
          value={form.tanggalPembelian}
          onChange={(e) => set('tanggalPembelian', e.target.value)}
        />
      </form>
    </Modal>
  );
};
