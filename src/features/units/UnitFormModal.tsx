import { useState, type FormEvent, useEffect } from 'react';
import { Car } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField, NumericField } from '@/shared/components/ui/Field';
import type { Unit, Transmisi, UnitFormData } from '@/features/units/unit.types';
import { useCreateUnit, useUpdateUnit } from '@/features/units/unit.hooks';
import { useMereks, useTipes } from '@/features/master/master.hooks';

interface UnitFormModalProps {
  open: boolean;
  onClose: () => void;
  unit?: Unit | null;
}

const emptyUnitForm = (): UnitFormData => ({
  merekId: '',
  tipeId: '',
  platNomor: '',
  tahun: new Date().getFullYear(),
  warna: '',
  transmisi: 'AUTOMATIC',
  noRangka: '',
  noMesin: '',
  kilometer: 0,
  tanggalPajak: new Date().toISOString().split('T')[0],
  hargaBeli: 0,
  tanggalPembelian: new Date().toISOString().split('T')[0],
  kelengkapans: [],
  dokumens: [],
});

export const UnitFormModal = ({ open, onClose, unit }: UnitFormModalProps) => {
  const [form, setForm] = useState<UnitFormData>(emptyUnitForm());

  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  const { data: mereksData } = useMereks({ page: 1, limit: 100 });
  const mereks = mereksData?.data || [];

  const { data: tipesData } = useTipes(form.merekId, { page: 1, limit: 100 });
  const tipes = tipesData?.data || [];

  useEffect(() => {
    if (open) {
      if (unit) {
        setForm({
          merekId: unit.merekId,
          tipeId: unit.tipeId,
          platNomor: unit.platNomor,
          tahun: unit.tahun,
          warna: unit.warna,
          transmisi: unit.transmisi,
          noRangka: unit.noRangka,
          noMesin: unit.noMesin,
          kilometer: unit.kilometer,
          tanggalPajak: unit.tanggalPajak ? new Date(unit.tanggalPajak).toISOString().split('T')[0] : '',
          hargaBeli: unit.hargaBeli,
          tanggalPembelian: unit.tanggalPembelian ? new Date(unit.tanggalPembelian).toISOString().split('T')[0] : '',
          kelengkapans: unit.unitKelengkapans?.map(k => k.perlengkapanId) || [],
          dokumens: unit.unitDokumens?.map(d => d.dokumenId) || [],
        });
      } else {
        setForm(emptyUnitForm());
      }
    }
  }, [open, unit]);

  const set = <K extends keyof UnitFormData>(key: K, value: UnitFormData[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'merekId' && f.merekId !== value) {
        next.tipeId = '';
      }
      return next;
    });
  };

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
