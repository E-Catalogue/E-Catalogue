import { useMemo, useState, type FormEvent } from 'react';
import { Car } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField, NumericField } from '@/shared/components/ui/Field';
import { CashAccountSelect } from '@/features/finance/components';
import { useMereks, useTipes } from '@/features/master/master.hooks';
import { notifyApiError } from '@/core/api/notify';
import { useCreateUnit, useUpdateUnit } from './unit.hooks';
import type { Transmisi, Unit, UnitFormData } from './unit.types';

interface UnitFormModalProps {
  open: boolean;
  onClose: () => void;
  unit?: Unit | null;
}

type UnitFormState = UnitFormData & {
  cashAccountId: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyUnitForm = (): UnitFormState => ({
  merekId: '',
  tipeId: '',
  platNomor: '',
  tahun: new Date().getFullYear(),
  warna: '',
  transmisi: 'AUTOMATIC',
  noRangka: '',
  noMesin: '',
  kilometer: 0,
  tanggalPajak: today(),
  hargaBeli: 0,
  tanggalPembelian: today(),
  cashAccountId: '',
  kelengkapans: [],
  dokumens: [],
});

const toForm = (unit?: Unit | null): UnitFormState => {
  if (!unit) return emptyUnitForm();
  return {
    merekId: unit.merekId ?? '',
    tipeId: unit.tipeId ?? '',
    platNomor: unit.platNomor ?? '',
    tahun: unit.tahun ?? new Date().getFullYear(),
    warna: unit.warna ?? '',
    transmisi: unit.transmisi ?? 'AUTOMATIC',
    noRangka: unit.noRangka ?? '',
    noMesin: unit.noMesin ?? '',
    kilometer: unit.kilometer ?? 0,
    tanggalPajak: unit.tanggalPajak?.slice(0, 10) ?? today(),
    hargaBeli: unit.hargaBeli ?? 0,
    tanggalPembelian: unit.tanggalPembelian?.slice(0, 10) ?? today(),
    cashAccountId: unit.cashAccountId ?? '',
    kelengkapans: unit.unitKelengkapans?.map((x) => x.perlengkapanId) ?? [],
    dokumens: unit.unitDokumens?.map((x) => x.dokumenId) ?? [],
  };
};

export const UnitFormModal = ({ open, onClose, unit }: UnitFormModalProps) => {
  const [form, setForm] = useState<UnitFormState>(() => toForm(unit));
  const [seedId, setSeedId] = useState<string | null | undefined>('init');
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const { data: merekData } = useMereks({ page: 1, limit: 100 });
  const { data: tipeData } = useTipes(form.merekId || null, { page: 1, limit: 100 });

  const currentSeed = unit?.id ?? null;
  if (open && seedId !== currentSeed) {
    setSeedId(currentSeed);
    setForm(toForm(unit));
  }

  const mereks = useMemo(() => (merekData?.data ?? []).filter((m) => m.isActive), [merekData]);
  const tipes = useMemo(() => (tipeData?.data ?? []).filter((t) => t.isActive), [tipeData]);
  const purchaseLocked = !!unit?.purchaseCashTransactionId;
  const isPending = createUnit.isPending || updateUnit.isPending;

  const set = <K extends keyof UnitFormState>(key: K, value: UnitFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload: UnitFormData = {
      ...form,
      tanggalPajak: new Date(form.tanggalPajak).toISOString(),
      tanggalPembelian: new Date(form.tanggalPembelian).toISOString(),
      cashAccountId: form.cashAccountId || undefined,
    };
    if (unit) {
      updateUnit.mutate({ id: unit.id, data: payload }, { onError: (err) => notifyApiError(err), onSuccess: onClose });
    } else {
      createUnit.mutate(payload, { onError: (err) => notifyApiError(err), onSuccess: onClose });
    }
  };

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
          <Button type="submit" form="unit-form" disabled={isPending}>{unit ? 'Simpan Perubahan' : 'Tambah Unit'}</Button>
        </>
      }
    >
      <form id="unit-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Merek"
          required
          value={form.merekId}
          onChange={(e) => {
            setForm((f) => ({ ...f, merekId: e.target.value, tipeId: '' }));
          }}
          options={[{ value: '', label: 'Pilih Merek' }, ...mereks.map((m) => ({ value: m.id, label: m.name }))]}
        />
        <SelectField
          label="Tipe / Model"
          required
          value={form.tipeId}
          onChange={(e) => set('tipeId', e.target.value)}
          options={[{ value: '', label: form.merekId ? 'Pilih Tipe' : 'Pilih Merek dahulu' }, ...tipes.map((t) => ({ value: t.id, label: t.name }))]}
          disabled={!form.merekId}
        />
        <NumericField label="Tahun" required value={form.tahun} onChange={(v) => set('tahun', v)} placeholder={String(new Date().getFullYear())} min={1980} max={new Date().getFullYear() + 1} />
        <TextField label="Warna" required value={form.warna} onChange={(e) => set('warna', e.target.value)} placeholder="mis. Hitam Metalik" />
        <SelectField
          label="Transmisi"
          value={form.transmisi}
          onChange={(e) => set('transmisi', e.target.value as Transmisi)}
          options={[{ value: 'AUTOMATIC', label: 'Automatic (AT)' }, { value: 'MANUAL', label: 'Manual (MT)' }]}
        />
        <NumericField label="Kilometer" required value={form.kilometer} onChange={(v) => set('kilometer', v)} suffix="km" placeholder="0" min={0} />
        <TextField label="Plat Nomor" required value={form.platNomor} onChange={(e) => set('platNomor', e.target.value)} placeholder="B 1234 ABC" />
        <TextField label="Tanggal Pajak" required type="date" value={form.tanggalPajak} onChange={(e) => set('tanggalPajak', e.target.value)} />
        <TextField label="No Rangka" required value={form.noRangka} onChange={(e) => set('noRangka', e.target.value)} />
        <TextField label="No Mesin" required value={form.noMesin} onChange={(e) => set('noMesin', e.target.value)} />
        <NumericField label="Harga Beli" required value={form.hargaBeli} onChange={(v) => set('hargaBeli', v)} prefix="Rp" placeholder="0" min={0} className={purchaseLocked ? 'opacity-70 pointer-events-none' : ''} />
        <TextField label="Tanggal Pembelian" required type="date" disabled={purchaseLocked} value={form.tanggalPembelian} onChange={(e) => set('tanggalPembelian', e.target.value)} />
        {!unit && <CashAccountSelect label="Akun Kas Pembelian" required value={form.cashAccountId} onChange={(v) => set('cashAccountId', v)} />}
        {purchaseLocked && (
          <p className="sm:col-span-2 text-[12px] font-semibold text-muted">
            Harga beli dan tanggal pembelian dikunci karena pembelian unit sudah tercatat di kas.
          </p>
        )}
      </form>
    </Modal>
  );
};
