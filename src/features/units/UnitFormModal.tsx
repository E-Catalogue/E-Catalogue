import { useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, Car, Check, Info, Save, Search } from 'lucide-react';
import { DateField } from '@/shared/components/ui/DateField';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField, NumericField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { CashAccountSelect } from '@/features/finance/components';
import { notifyApiError } from '@/core/api/notify';
import { getApiErrorCode } from '@/core/api/apiError';
import { useCreateUnit, useUnit, useUnitImageMutations, useUnitLookups, useUpdateUnit } from './unit.hooks';
import { unitDisplayName } from './unit.display';
import { UnitGalleryManager } from './UnitGalleryManager';
import { BAHAN_BAKAR_LABEL, FINAL_CYCLE_POLICY_DESCRIPTION, FINAL_CYCLE_POLICY_LABEL, type BahanBakar, type FinalCyclePolicy, type FundingSource, type MasterDokumen, type MasterKelengkapan, type Transmisi, type Unit, type UnitFormData } from './unit.types';

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
  bahanBakar: null,
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
    bahanBakar: unit.bahanBakar ?? null,
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

/* ── Stepper: 4 langkah pembuatan/pengubahan Unit ── */
const STEPS: { label: string; desc: string }[] = [
  { label: 'Data Unit', desc: 'Identitas & spesifikasi' },
  { label: 'Pembelian & Pendanaan', desc: 'Harga beli & sumber dana' },
  { label: 'Kelengkapan & Dokumen', desc: 'Perlengkapan & surat' },
  { label: 'Foto Unit', desc: 'Galeri foto katalog' },
];

const StepIndicator = ({ activeIndex, maxReached, onJump }: { activeIndex: number; maxReached: number; onJump: (i: number) => void }) => (
  <div className="w-full rounded-2xl border border-border bg-surface-soft/70 px-4 sm:px-6 py-4 mb-5">
    <div className="flex items-center w-full">
      {STEPS.map((s, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'upcoming';
        const reachable = i <= maxReached;
        return (
          <div key={s.label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''} min-w-0`}>
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onJump(i)}
              className="flex items-center gap-3 min-w-0 disabled:cursor-not-allowed group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-extrabold border-2 shrink-0 transition-all ${
                state === 'done' ? 'bg-accent-green border-accent-green text-white'
                  : state === 'active' ? 'bg-primary border-primary text-white shadow-glow scale-105'
                  : 'bg-surface border-border text-muted group-hover:border-primary/50'
              }`}>
                {state === 'done' ? <Check size={18} strokeWidth={3} /> : i + 1}
              </div>
              <div className="hidden md:block text-left min-w-0">
                <p className={`text-[13px] font-extrabold leading-tight truncate ${state === 'upcoming' ? 'text-muted' : 'text-ink'}`}>{s.label}</p>
                <p className="text-[11px] font-medium text-muted leading-tight truncate">{s.desc}</p>
              </div>
            </button>
            {i < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 sm:mx-3 rounded-full transition-colors ${i < activeIndex ? 'bg-accent-green' : 'bg-border'}`} />}
          </div>
        );
      })}
    </div>
    {/* Label ringkas untuk mobile (deskripsi disembunyikan di layar kecil) */}
    <p className="md:hidden mt-3 text-center text-[13px] font-extrabold text-ink">{STEPS[activeIndex]?.label}</p>
  </div>
);

const Locked = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 py-8 px-4 text-center justify-center text-[12px] font-semibold text-muted border border-dashed border-border rounded-xl">
    <Info size={14} className="shrink-0" /> {text}
  </div>
);

export const UnitFormModal = ({ open, onClose, unit }: UnitFormModalProps) => {
  const [form, setForm] = useState<UnitFormState>(() => toForm(unit));
  const [seedId, setSeedId] = useState<string | null | undefined>('init');
  const [cyclePolicyError, setCyclePolicyError] = useState('');
  const [step, setStep] = useState(0);
  const [createdUnit, setCreatedUnit] = useState<Unit | null>(null);
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
    setStep(0);
    setCreatedUnit(null);
  }

  const persistedUnit = unit ?? createdUnit;
  const isEdit = !!unit;
  // Create: step Foto terkunci sampai unit berhasil dibuat. Edit: seluruh step langsung bisa diakses.
  const maxReachableStep = isEdit ? 3 : (createdUnit ? 3 : 2);
  const activeUnitId = persistedUnit?.id;
  const { data: liveUnitRes } = useUnit(step === 3 ? activeUnitId : undefined);
  const liveImages = liveUnitRes?.data?.unitImages ?? persistedUnit?.unitImages ?? [];
  const imageMutations = useUnitImageMutations(activeUnitId ?? '');

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
  // Harga beli boleh diedit selama harga awal belum difinalisasi. Terkunci bila sudah finalisasi,
  // atau unit berpendanaan investor yang modalnya sudah dialokasikan.
  const purchaseLocked = !!unit?.pricingFinalizedAt
    || (unit?.fundingAgreement?.fundingSource === 'INVESTOR' && !!unit?.purchaseCashTransactionId);
  const isPending = createUnit.isPending || updateUnit.isPending;
  const fieldsLocked = !isEdit && !!createdUnit; // data unit sudah tersimpan, step 1-3 jadi baca-saja

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

  const goJump = (i: number) => { if (i <= maxReachableStep) setStep(i); };
  const goBack = () => setStep((s) => Math.max(0, s - 1));

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
          ? {
              fundingSource: 'INVESTOR',
              investorId: form.investorId,
              finalCyclePolicy: fundingRequiresFinalCycle ? form.finalCyclePolicy || undefined : undefined,
            }
          : { fundingSource: 'COMPANY_OWNED' },
    };
    if (unit) {
      updateUnit.mutate({ id: unit.id, data: payload }, { onError: (err) => notifyApiError(err), onSuccess: onClose });
    } else {
      createUnit.mutate(payload, {
        onError: (err) => {
          if (getApiErrorCode(err) === 'FINAL_CYCLE_POLICY_REQUIRED') setCyclePolicyError('Tipe pembayaran investor wajib dipilih.');
          notifyApiError(err);
        },
        onSuccess: (res) => { setCreatedUnit(res.data); setStep(3); },
      });
    }
  };

  const submitForm = () => {
    const form_ = document.getElementById('unit-form') as HTMLFormElement | null;
    form_?.requestSubmit();
  };

  // Footer dibedakan create vs edit. Edit: di step Kelengkapan/Dokumen tampil 3 tombol
  // (Kembali, Simpan Perubahan, Lanjut ke Foto) agar bisa langsung ke galeri tanpa menyimpan dulu.
  const backButton = step > 0
    ? <Button variant="secondary" onClick={goBack} disabled={isPending}>Kembali</Button>
    : <Button variant="secondary" onClick={onClose} disabled={isPending}>Batal</Button>;

  const renderFooterActions = () => {
    if (step === 3) return <Button onClick={onClose}>Selesai</Button>;
    if (isEdit) {
      const nextLabel = step === 2 ? 'Lanjut ke Foto' : 'Lanjut';
      return (
        <>
          <Button variant="secondary" icon={<ArrowRight size={15} />} onClick={() => setStep(step + 1)}>{nextLabel}</Button>
          <Button icon={<Save size={15} />} onClick={submitForm} loading={updateUnit.isPending} disabled={!!nameError}>Simpan Perubahan</Button>
        </>
      );
    }
    // Create
    if (step < 2) {
      return <Button icon={<ArrowRight size={15} />} onClick={() => setStep(step + 1)} disabled={step === 0 ? !!nameError : fundingIncomplete}>Lanjut</Button>;
    }
    // step === 2 (create)
    if (fieldsLocked) return <Button icon={<ArrowRight size={15} />} onClick={() => setStep(3)}>Lanjut ke Foto</Button>;
    return <Button icon={<Save size={15} />} onClick={submitForm} loading={isPending} disabled={isPending || fundingIncomplete || !!nameError}>Buat Unit &amp; Lanjut ke Foto</Button>;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Car size={20} />}
      title={unit ? `Edit ${unitDisplayName(unit)}` : 'Tambah Unit Baru'}
      subtitle={unit ? unit.platNomor : 'Lengkapi data unit mobil dalam beberapa langkah'}
      size="xl"
      footer={
        <div className="flex w-full flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div>{backButton}</div>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5">{renderFooterActions()}</div>
        </div>
      }
    >
      <StepIndicator activeIndex={step} maxReached={maxReachableStep} onJump={goJump} />

      <form id="unit-form" onSubmit={handleSubmit} className={step === 0 || step === 1 || step === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'hidden'}>
        {step === 0 && (
          <>
            <div className="sm:col-span-2">
              <TextField
                label="Nama Unit"
                required
                disabled={fieldsLocked}
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
              disabled={fieldsLocked}
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
              disabled={fieldsLocked || !form.merekId}
              value={form.tipeId}
              onChange={(v) => set('tipeId', v)}
              options={tipes.map((t) => ({ value: t.id, label: t.name }))}
              placeholder={form.merekId ? 'Pilih Tipe' : 'Pilih Merek dahulu'}
              searchPlaceholder="Cari tipe..."
            />
            <NumericField label="Tahun" required thousands={false} disabled={fieldsLocked} value={form.tahun} onChange={(v) => set('tahun', v)} placeholder={String(new Date().getFullYear())} min={1980} max={new Date().getFullYear() + 1} />
            <TextField label="Warna" required disabled={fieldsLocked} value={form.warna} onChange={(e) => set('warna', e.target.value)} placeholder="mis. Hitam Metalik" />
            <SelectField
              label="Transmisi"
              disabled={fieldsLocked}
              value={form.transmisi}
              onChange={(e) => set('transmisi', e.target.value as Transmisi)}
              options={[{ value: 'AUTOMATIC', label: 'Automatic (AT)' }, { value: 'MANUAL', label: 'Manual (MT)' }]}
            />
            <SelectField
              label="Bahan Bakar"
              disabled={fieldsLocked}
              value={form.bahanBakar ?? ''}
              onChange={(e) => set('bahanBakar', (e.target.value || null) as BahanBakar | null)}
              options={[
                { value: '', label: 'Tidak diisi' },
                ...(Object.keys(BAHAN_BAKAR_LABEL) as BahanBakar[]).map((v) => ({ value: v, label: BAHAN_BAKAR_LABEL[v] })),
              ]}
            />
            <NumericField label="Kilometer" required disabled={fieldsLocked} value={form.kilometer} onChange={(v) => set('kilometer', v)} suffix="km" placeholder="0" min={0} />
            <TextField label="Plat Nomor" required disabled={fieldsLocked} value={form.platNomor} onChange={(e) => set('platNomor', e.target.value)} placeholder="B 1234 ABC" />
            <DateField label="Tanggal Pajak" required disabled={fieldsLocked} value={form.tanggalPajak} onChange={(v) => set('tanggalPajak', v)} />
            <TextField label="No Rangka" required disabled={fieldsLocked} value={form.noRangka} onChange={(e) => set('noRangka', e.target.value)} />
            <TextField label="No Mesin" required disabled={fieldsLocked} value={form.noMesin} onChange={(e) => set('noMesin', e.target.value)} />
          </>
        )}

        {step === 1 && (
          <>
            <NumericField label="Harga Beli" required disabled={fieldsLocked} value={form.purchaseCost} onChange={(v) => set('purchaseCost', v)} prefix="Rp" placeholder="0" min={0} className={purchaseLocked ? 'opacity-70 pointer-events-none' : ''} />
            <DateField label="Tanggal Pembelian" required disabled={fieldsLocked || purchaseLocked} value={form.tanggalPembelian} onChange={(v) => set('tanggalPembelian', v)} />
            {!unit && <CashAccountSelect label="Akun Kas Pembelian" required disabled={fieldsLocked} value={form.cashAccountId} onChange={(v) => set('cashAccountId', v)} accounts={cashAccounts} loading={lookupsLoading} />}
            {purchaseLocked && (
              <p className="sm:col-span-2 text-[12px] font-semibold text-muted">
                {unit?.pricingFinalizedAt
                  ? 'Harga beli & tanggal pembelian dikunci karena harga awal unit sudah difinalisasi.'
                  : 'Harga beli & tanggal pembelian dikunci karena unit ini didanai investor (modal sudah dialokasikan).'}
              </p>
            )}

            {!unit && (
              <div className="sm:col-span-2 rounded-2xl border border-border bg-surface-soft p-3.5 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <SelectField
                    label="Sumber Dana"
                    required
                    disabled={fieldsLocked}
                    value={form.fundingSource}
                    onChange={(e) => {
                      const fundingSource = e.target.value as FundingSource;
                      setForm((current) => ({
                        ...current,
                        fundingSource,
                        investorId: '',
                        finalCyclePolicy: fundingSource === 'INVESTOR' ? 'FULL' : '',
                      }));
                    }}
                    options={[
                      { value: 'COMPANY_OWNED', label: 'Milik Perusahaan' },
                      { value: 'INVESTOR', label: 'Investor' },
                    ]}
                  />
                  {fundingRequiresInvestor && (
                    <SearchableSelect
                      label="Investor"
                      required
                      disabled={fieldsLocked}
                      value={form.investorId}
                      onChange={(v) => {
                        const investor = investors.find((item) => item.id === v);
                        setForm((current) => ({
                          ...current,
                          investorId: v,
                          finalCyclePolicy: investor?.scheme === 'FIXED_MONTHLY'
                            ? (current.finalCyclePolicy || 'FULL')
                            : '',
                        }));
                      }}
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
                  <div className="space-y-2">
                    <SelectField
                      label="Tipe Pembayaran Investor"
                      required
                      disabled={fieldsLocked}
                      value={form.finalCyclePolicy}
                      onChange={(e) => { set('finalCyclePolicy', e.target.value as FinalCyclePolicy); setCyclePolicyError(''); }}
                      options={[
                        { value: '', label: 'Pilih tipe pembayaran' },
                        ...(['FULL', 'PRORATA', 'NONE'] as FinalCyclePolicy[]).map((value) => ({ value, label: FINAL_CYCLE_POLICY_LABEL[value] })),
                      ]}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(['FULL', 'PRORATA', 'NONE'] as FinalCyclePolicy[]).map((value) => (
                        <button type="button" key={value} disabled={fieldsLocked} onClick={() => { set('finalCyclePolicy', value); setCyclePolicyError(''); }} className={`rounded-xl border p-3 text-left transition-colors ${form.finalCyclePolicy === value ? 'border-primary bg-primary-light' : 'border-border bg-surface hover:border-primary/50'}`}>
                          <p className="text-[11px] font-extrabold text-ink">{FINAL_CYCLE_POLICY_LABEL[value]}</p>
                          <p className="mt-1 text-[10px] font-medium leading-relaxed text-muted">{FINAL_CYCLE_POLICY_DESCRIPTION[value]}</p>
                        </button>
                      ))}
                    </div>
                    {cyclePolicyError && <p className="text-[11px] font-semibold text-semantic-error">{cyclePolicyError}</p>}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {step === 2 && (
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
        )}
      </form>

      {step === 3 && (
        activeUnitId ? (
          <UnitGalleryManager
            images={liveImages}
            uploading={imageMutations.uploadMany.isPending}
            reordering={imageMutations.reorder.isPending}
            deleting={imageMutations.remove.isPending}
            settingMain={imageMutations.setMain.isPending}
            onUpload={(files, mainIndex) => imageMutations.uploadMany.mutateAsync({ files, mainIndex }).catch((err) => { notifyApiError(err); throw err; })}
            onReorder={(next) => imageMutations.reorder.mutate(next, { onError: (err) => notifyApiError(err) })}
            onSetMain={(imageId) => imageMutations.setMain.mutate(imageId, { onError: (err) => notifyApiError(err) })}
            onDelete={(imageId) => imageMutations.remove.mutate(imageId, { onError: (err) => notifyApiError(err) })}
            emptyHint="Belum ada foto — unggah beberapa foto sekaligus"
          />
        ) : (
          <Locked text="Simpan data unit terlebih dahulu untuk mengunggah foto." />
        )
      )}
    </Modal>
  );
};
