import { useMemo, useState, type FormEvent } from 'react';
import { Car, Search } from 'lucide-react';
import { DateField } from '@/shared/components/ui/DateField';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField, NumericField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { CashAccountSelect } from '@/features/finance/components';
import { notifyApiError } from '@/core/api/notify';
import { useCreateUnit, useUnitLookups, useUpdateUnit } from './unit.hooks';
import { unitDisplayName } from './unit.display';
import type { FinalCyclePolicy, FundingSource, MasterDokumen, MasterKelengkapan, Transmisi, Unit, UnitFormData } from './unit.types';

interface UnitFormModalProps {
  open: boolean;
  onClose: () => void;
  unit?: Unit | null;
}

type UnitFormState = UnitFormData & {
  cashAccountId: string;
  fundingSource: FundingSource;
  investorId: string;
  finalCyclePolicy: FinalCyclePolicy | '';
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyUnitForm = (): UnitFormState => ({
  name: '',
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
  purchaseCost: 0,
  tanggalPembelian: today(),
  cashAccountId: '',
  fundingSource: 'COMPANY_OWNED',
  investorId: '',
  finalCyclePolicy: '',
  kelengkapans: [],
  dokumens: [],
});

const toForm = (unit?: Unit | null): UnitFormState => {
  if (!unit) return emptyUnitForm();
  return {
    name: unit.name ?? '',
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
    purchaseCost: unit.purchaseCost ?? 0,
    tanggalPembelian: unit.tanggalPembelian?.slice(0, 10) ?? today(),
    cashAccountId: unit.cashAccountId ?? '',
    // Pendanaan hanya diisi saat create — pada edit funding sudah terkunci (dikelola lewat tab Pendanaan terpisah).
    fundingSource: unit.fundingAgreement?.fundingSource ?? 'COMPANY_OWNED',
    investorId: unit.fundingAgreement?.investorId ?? '',
    finalCyclePolicy: unit.fundingAgreement?.finalCyclePolicy ?? '',
    kelengkapans: unit.unitKelengkapans?.map((x) => x.perlengkapanId) ?? [],
    dokumens: unit.unitDokumens?.map((x) => x.dokumenId) ?? [],
  };
};

interface ChecklistSectionProps {
  title: string;
  loading: boolean;
  items: Array<MasterKelengkapan | MasterDokumen>;
  selected: string[];
  onToggle: (id: string, checked: boolean) => void;
}

const ChecklistSection = ({ title, loading, items, selected, onToggle }: ChecklistSectionProps) => {
  const [search, setSearch] = useState('');
  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.code?.toLowerCase().includes(q);
  });

  return (
  <div className="rounded-2xl border border-border bg-surface-soft p-3.5">
    <div className="flex items-center justify-between gap-3 mb-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{title}</p>
      <span className="text-[10px] font-extrabold text-muted bg-surface px-2 py-1 rounded-full">
        {selected.length} dipilih
      </span>
    </div>
    {!loading && items.length > 0 && (
      <div className="relative mb-2.5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Cari ${title.toLowerCase()}...`}
          className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface border border-border text-[12px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>
    )}
    {loading ? (
      <p className="text-[12px] font-semibold text-muted">Memuat data...</p>
    ) : items.length === 0 ? (
      <p className="text-[12px] font-semibold text-muted">Belum ada master aktif.</p>
    ) : filtered.length === 0 ? (
      <p className="text-[12px] font-semibold text-muted">Tidak ada hasil untuk "{search}".</p>
    ) : (
      <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
        {filtered.map((item) => {
          const checked = selected.includes(item.id);
          return (
            <label
              key={item.id}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[12px] font-semibold transition-colors cursor-pointer ${
                checked ? 'border-primary bg-primary/8 text-primary' : 'border-border bg-surface text-ink-soft hover:border-primary/60'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onToggle(item.id, e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <span className="text-[10px] font-extrabold text-muted">{item.code}</span>
            </label>
          );
        })}
      </div>
    )}
  </div>
  );
};

export const UnitFormModal = ({ open, onClose, unit }: UnitFormModalProps) => {
  const [form, setForm] = useState<UnitFormState>(() => toForm(unit));
  const [seedId, setSeedId] = useState<string | null | undefined>('init');
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  // `.prd/update_module_owned_lookup_20260721.md` §4.8 — SELURUH pilihan form Unit (merek/tipe,
  // dokumen, perlengkapan, akun kas, investor+modal, pricing) diambil dari SATU endpoint
  // `/units/lookups`. Tidak lagi menggabung CRUD master (`/mereks`, `/dokumens`, dst) + finance lookup.
  const { data: lookupsData, isLoading: lookupsLoading } = useUnitLookups(open);

  const currentSeed = unit?.id ?? null;
  if (open && seedId !== currentSeed) {
    setSeedId(currentSeed);
    setForm(toForm(unit));
  }

  const brands = useMemo(() => lookupsData?.data.brands ?? [], [lookupsData]);
  const mereks = useMemo(() => brands.map((b) => ({ id: b.id, name: b.name })), [brands]);
  const tipes = useMemo(() => brands.find((b) => b.id === form.merekId)?.tipes ?? [], [brands, form.merekId]);
  const kelengkapans = useMemo(() => lookupsData?.data.equipment ?? [], [lookupsData]);
  const dokumens = useMemo(() => lookupsData?.data.documents ?? [], [lookupsData]);
  const cashAccounts = useMemo(() => lookupsData?.data.cashAccounts ?? [], [lookupsData]);
  const investors = useMemo(() => lookupsData?.data.investors ?? [], [lookupsData]);
  const kelengkapanLoading = lookupsLoading;
  const dokumenLoading = lookupsLoading;
  const selectedInvestor = useMemo(() => investors.find((i) => i.id === form.investorId), [investors, form.investorId]);
  const selectedCapitalAccount = selectedInvestor?.capitalAccounts?.[0];
  const purchaseLocked = !!unit?.purchaseCashTransactionId;
  const isPending = createUnit.isPending || updateUnit.isPending;

  const set = <K extends keyof UnitFormState>(key: K, value: UnitFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleChecklist = (key: 'kelengkapans' | 'dokumens', id: string, checked: boolean) => {
    setForm((f) => {
      const next = new Set(f[key]);
      if (checked) next.add(id);
      else next.delete(id);
      return { ...f, [key]: Array.from(next) };
    });
  };

  // Validasi Nama Unit (PRD frontend_unit_name_20260722 §7.3): wajib, 2–191 karakter setelah trim.
  const nameTrimmed = form.name.trim();
  const nameError =
    nameTrimmed.length === 0 ? 'Nama unit wajib diisi.'
    : nameTrimmed.length < 2 ? 'Nama unit minimal 2 karakter.'
    : nameTrimmed.length > 191 ? 'Nama unit maksimal 191 karakter.'
    : null;

  // Sumber dana hanya berlaku saat CREATE — backend tidak menerima `funding` pada PUT /units/:id.
  const fundingRequiresInvestor = form.fundingSource === 'INVESTOR';
  const fundingRequiresFinalCycle = fundingRequiresInvestor && selectedInvestor?.scheme === 'FIXED_MONTHLY';
  const insufficientCapital =
    fundingRequiresInvestor && !!selectedCapitalAccount && selectedCapitalAccount.availableBalance < form.purchaseCost;
  const fundingIncomplete =
    !unit &&
    fundingRequiresInvestor &&
    (!form.investorId || (fundingRequiresFinalCycle && !form.finalCyclePolicy) || insufficientCapital);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (fundingIncomplete || nameError) return;
    const payload: UnitFormData = {
      ...form,
      name: nameTrimmed,
      tanggalPajak: new Date(form.tanggalPajak).toISOString(),
      tanggalPembelian: new Date(form.tanggalPembelian).toISOString(),
      cashAccountId: form.cashAccountId || undefined,
      funding: unit
        ? undefined
        : form.fundingSource === 'INVESTOR'
          ? { fundingSource: 'INVESTOR', investorId: form.investorId, finalCyclePolicy: form.finalCyclePolicy || undefined }
          : { fundingSource: 'COMPANY_OWNED' },
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
      title={unit ? `Edit ${unitDisplayName(unit)}` : 'Tambah Unit Baru'}
      subtitle={unit ? unit.platNomor : 'Lengkapi data unit mobil'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>Batal</Button>
          <Button type="submit" form="unit-form" disabled={isPending || fundingIncomplete || !!nameError}>{unit ? 'Simpan Perubahan' : 'Tambah Unit'}</Button>
        </>
      }
    >
      <form id="unit-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <TextField
            label="Nama Unit"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="mis. Avanza G AT Putih 2023"
          />
          {nameError && form.name.length > 0 && (
            <p className="mt-1 text-[11px] font-semibold text-semantic-error">{nameError}</p>
          )}
        </div>
        <SearchableSelect
          label="Merek"
          required
          value={form.merekId}
          onChange={(v) => setForm((f) => ({ ...f, merekId: v, tipeId: '' }))}
          options={mereks.map((m) => ({ value: m.id, label: m.name }))}
          loading={lookupsLoading}
          placeholder="Pilih Merek"
          searchPlaceholder="Cari merek..."
        />
        <SearchableSelect
          label="Tipe / Model"
          required
          value={form.tipeId}
          onChange={(v) => set('tipeId', v)}
          options={tipes.map((t) => ({ value: t.id, label: t.name }))}
          disabled={!form.merekId}
          placeholder={form.merekId ? 'Pilih Tipe' : 'Pilih Merek dahulu'}
          searchPlaceholder="Cari tipe..."
        />
        <NumericField label="Tahun" required thousands={false} value={form.tahun} onChange={(v) => set('tahun', v)} placeholder={String(new Date().getFullYear())} min={1980} max={new Date().getFullYear() + 1} />
        <TextField label="Warna" required value={form.warna} onChange={(e) => set('warna', e.target.value)} placeholder="mis. Hitam Metalik" />
        <SelectField
          label="Transmisi"
          value={form.transmisi}
          onChange={(e) => set('transmisi', e.target.value as Transmisi)}
          options={[{ value: 'AUTOMATIC', label: 'Automatic (AT)' }, { value: 'MANUAL', label: 'Manual (MT)' }]}
        />
        <NumericField label="Kilometer" required value={form.kilometer} onChange={(v) => set('kilometer', v)} suffix="km" placeholder="0" min={0} />
        <TextField label="Plat Nomor" required value={form.platNomor} onChange={(e) => set('platNomor', e.target.value)} placeholder="B 1234 ABC" />
        <DateField label="Tanggal Pajak" required value={form.tanggalPajak} onChange={(v) => set('tanggalPajak', v)} />
        <TextField label="No Rangka" required value={form.noRangka} onChange={(e) => set('noRangka', e.target.value)} />
        <TextField label="No Mesin" required value={form.noMesin} onChange={(e) => set('noMesin', e.target.value)} />
        <NumericField label="Harga Beli" required value={form.purchaseCost} onChange={(v) => set('purchaseCost', v)} prefix="Rp" placeholder="0" min={0} className={purchaseLocked ? 'opacity-70 pointer-events-none' : ''} />
        <DateField label="Tanggal Pembelian" required disabled={purchaseLocked} value={form.tanggalPembelian} onChange={(v) => set('tanggalPembelian', v)} />
        {!unit && <CashAccountSelect label="Akun Kas Pembelian" required value={form.cashAccountId} onChange={(v) => set('cashAccountId', v)} accounts={cashAccounts} loading={lookupsLoading} />}
        {purchaseLocked && (
          <p className="sm:col-span-2 text-[12px] font-semibold text-muted">
            Harga beli dan tanggal pembelian dikunci karena pembelian unit sudah tercatat di kas.
          </p>
        )}

        {!unit && (
          <div className="sm:col-span-2 rounded-2xl border border-border bg-surface-soft p-3.5 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <SelectField
                label="Sumber Dana"
                required
                value={form.fundingSource}
                onChange={(e) => set('fundingSource', e.target.value as FundingSource)}
                options={[
                  { value: 'COMPANY_OWNED', label: 'Milik Perusahaan' },
                  { value: 'INVESTOR', label: 'Investor' },
                ]}
              />
              {fundingRequiresInvestor && (
                <SearchableSelect
                  label="Investor"
                  required
                  value={form.investorId}
                  onChange={(v) => set('investorId', v)}
                  loading={lookupsLoading}
                  options={investors.map((i) => ({ value: i.id, label: i.name, sublabel: `${i.scheme === 'FIXED_MONTHLY' ? 'Fixed Monthly' : 'Profit Share'} ${i.defaultRate}%` }))}
                  placeholder="Pilih investor"
                  searchPlaceholder="Cari investor..."
                />
              )}
            </div>
            {fundingRequiresInvestor && selectedInvestor && (
              <p className={`text-[12px] font-semibold ${insufficientCapital ? 'text-semantic-error' : 'text-muted'}`}>
                Saldo modal tersedia: {selectedCapitalAccount ? selectedCapitalAccount.availableBalance.toLocaleString('id-ID') : 0}
                {insufficientCapital ? ' — tidak mencukupi harga beli unit ini.' : ''}
              </p>
            )}
            {fundingRequiresFinalCycle && (
              <SelectField
                label="Aturan Siklus Terakhir"
                required
                value={form.finalCyclePolicy}
                onChange={(e) => set('finalCyclePolicy', e.target.value as FinalCyclePolicy)}
                options={[
                  { value: '', label: 'Pilih aturan' },
                  { value: 'FULL', label: 'Full' },
                  { value: 'NONE', label: 'None' },
                  { value: 'PRORATA', label: 'Prorata' },
                ]}
              />
            )}
          </div>
        )}

        <div className="sm:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChecklistSection
            title="Perlengkapan"
            loading={kelengkapanLoading}
            items={kelengkapans}
            selected={form.kelengkapans}
            onToggle={(id, checked) => toggleChecklist('kelengkapans', id, checked)}
          />
          <ChecklistSection
            title="Dokumen"
            loading={dokumenLoading}
            items={dokumens}
            selected={form.dokumens}
            onToggle={(id, checked) => toggleChecklist('dokumens', id, checked)}
          />
        </div>
      </form>
    </Modal>
  );
};
