import { useState } from 'react';
import {
  BookOpen, Wallet, TrendingUp, Percent, Lock, RefreshCw,
  Loader2, ArrowDownLeft, ArrowUpRight, Landmark, ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Pagination } from '@/shared/components/ui/Pagination';
import { Button } from '@/shared/components/ui/Button';
import { MonthField } from '@/shared/components/ui/MonthField';
import { Tooltip } from '@/shared/components/ui/Tooltip';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { getApiErrorCode, getApiErrorMessage } from '@/core/api/apiError';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { CashAccountSelect, FinanceErrorBanner } from '@/features/finance/components';
import { useBookCashAccounts } from '@/features/finance/lookup';
import {
  useBookCashSummary, useBookLedger, useBookMutations, useBookPeriods, useBookProfitSummary, useTaxSettings,
} from './book.hooks';
import {
  isConsolidatedSummary, TAX_MISSING_LABEL, TAX_RESERVE_STATUS_COLOR, TAX_RESERVE_STATUS_LABEL,
  BOOK_PERIOD_STATUS_COLOR, BOOK_PERIOD_STATUS_LABEL,
  type BookLedgerRow, type BookPeriod, type CashSummaryFields, type ProfitSummaryFields,
  type RetriedTaxSettlement, type TaxReadiness,
} from './book.types';

type Tab = 'ringkasan' | 'ledger' | 'pajak';
const currentPeriod = () => new Date().toISOString().slice(0, 7);
const idr = (n: number) => formatCurrency(n, { compact: true });

const KpiCard = ({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Wallet; color: string }) => (
  <div className="bg-surface rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between">
    <div className="flex items-start justify-between gap-2 mb-3">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted break-words">{label}</span>
      <div className={`w-9 h-9 rounded-xl ${color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon size={18} />
      </div>
    </div>
    <span className="text-xl font-extrabold text-ink break-words">{value}</span>
  </div>
);

// ── Tab: Ringkasan ───────────────────────────────────────────────────────────

const RingkasanTab = ({
  branchKey, branchHeader, period, isOwner, selectedBranchId, canClose,
}: {
  branchKey: string; branchHeader: Record<string, string> | undefined; period: string;
  isOwner: boolean; selectedBranchId: string | null; canClose: boolean;
}) => {
  const cash = useBookCashSummary(branchKey, { period }, branchHeader);
  const profit = useBookProfitSummary(branchKey, { period }, branchHeader);
  const periods = useBookPeriods(branchKey, { period }, branchHeader);
  const m = useBookMutations();
  const [confirmClose, setConfirmClose] = useState(false);
  const [closeError, setCloseError] = useState<{ code?: string; message: string } | null>(null);

  const loading = cash.isLoading || profit.isLoading;
  const cashData = cash.data;
  const profitData = profit.data;
  const cashFields: CashSummaryFields | null = cashData ? (isConsolidatedSummary(cashData) ? cashData.consolidated : cashData) : null;
  const profitFields: ProfitSummaryFields | null = profitData ? (isConsolidatedSummary(profitData) ? profitData.consolidated : profitData) : null;
  const cashBreakdown = cashData && isConsolidatedSummary(cashData) ? cashData.breakdown : null;

  const existingSnapshot: BookPeriod | undefined = (periods.data ?? []).find((p) => p.period === period && p.branchId === selectedBranchId);
  const alreadyClosedThisBranch = branchHeader && (periods.data ?? []).some((p) => p.period === period && p.status === 'CLOSED');
  const isPastPeriod = period < currentPeriod();
  const closeBlocked = isOwner && !selectedBranchId;

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
      ) : (
        <>
          <div>
            <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-muted mb-3">Kas — Periode {period}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Saldo Awal" value={idr(cashFields?.openingCash ?? 0)} icon={Wallet} color="bg-accent-blue" />
              <KpiCard label="Kas Masuk" value={idr(cashFields?.cashIn ?? 0)} icon={ArrowDownLeft} color="bg-accent-green" />
              <KpiCard label="Kas Keluar" value={idr(cashFields?.cashOut ?? 0)} icon={ArrowUpRight} color="bg-semantic-error" />
              <KpiCard label="Saldo Akhir" value={idr(cashFields?.endingCash ?? 0)} icon={Landmark} color="bg-primary" />
            </div>
          </div>

          <div>
            <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-muted mb-3">Laba Rugi — Periode {period}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Revenue Penjualan" value={idr(profitFields?.salesRevenue ?? 0)} icon={TrendingUp} color="bg-accent-green" />
              <KpiCard label="Unit Terjual" value={String(profitFields?.unitSold ?? 0)} icon={ShieldCheck} color="bg-accent-blue" />
              <KpiCard label="HPP Unit" value={idr(profitFields?.unitHpp ?? 0)} icon={Wallet} color="bg-accent-amber" />
              <KpiCard label="Laba Kotor" value={idr(profitFields?.grossProfit ?? 0)} icon={TrendingUp} color="bg-primary" />
              <KpiCard label="Beban Operasional" value={idr(profitFields?.operationalExpense ?? 0)} icon={ArrowUpRight} color="bg-semantic-error" />
              <KpiCard label="Beban Payroll" value={idr(profitFields?.payrollExpense ?? 0)} icon={ArrowUpRight} color="bg-semantic-error" />
              <KpiCard label="Laba Bersih Operasional" value={idr(profitFields?.operationalNetProfit ?? 0)} icon={TrendingUp} color="bg-primary" />
              <KpiCard label="Provisi Pajak" value={idr(profitFields?.taxProvision ?? 0)} icon={Percent} color="bg-accent-amber" />
              <KpiCard label="Laba Investor" value={idr(profitFields?.investorProfit ?? 0)} icon={TrendingUp} color="bg-accent-blue" />
              <KpiCard label="Fixed Return Investor" value={idr(profitFields?.fixedReturnExpense ?? 0)} icon={ArrowUpRight} color="bg-semantic-error" />
              <KpiCard label="Rekondisi Tambahan" value={idr(profitFields?.additionalReconditioningCost ?? 0)} icon={ArrowUpRight} color="bg-semantic-error" />
              <KpiCard label="Insentif Sales Accrued" value={idr(profitFields?.salesIncentiveAccrued ?? 0)} icon={ArrowUpRight} color="bg-semantic-error" />
              <KpiCard label="Laba Bersih Perusahaan" value={idr(profitFields?.companyNetProfit ?? 0)} icon={TrendingUp} color="bg-primary" />
            </div>
          </div>

          {cashBreakdown && cashBreakdown.length > 0 && (
            <SectionCard title="Rincian per Cabang" icon={<Landmark size={16} />} bodyClassName="p-0 md:p-0">
              <DataTable
                columns={[
                  { header: 'Cabang', cell: (r) => <span className="font-bold text-ink">{r.branch?.nama}</span> },
                  { header: 'Saldo Awal', align: 'right', cell: (r) => idr(r.openingCash) },
                  { header: 'Kas Masuk', align: 'right', cell: (r) => idr(r.cashIn) },
                  { header: 'Kas Keluar', align: 'right', cell: (r) => idr(r.cashOut) },
                  { header: 'Saldo Akhir', align: 'right', cell: (r) => idr(r.endingCash) },
                ]}
                data={cashBreakdown}
                rowKey={(r) => r.branch.id}
              />
            </SectionCard>
          )}

          <SectionCard
            title="Tutup Periode Pembukuan"
            icon={<Lock size={16} />}
            subtitle="Menyimpan snapshot akhir periode secara permanen — tidak dapat dibuka kembali."
          >
            {closeError && <div className="mb-4"><FinanceErrorBanner code={closeError.code} message={closeError.message} onDismiss={() => setCloseError(null)} /></div>}
            <div className="flex flex-wrap items-center gap-3">
              {existingSnapshot ? (
                <span className={`inline-flex px-3 py-1.5 rounded-xl text-[11px] font-bold ${BOOK_PERIOD_STATUS_COLOR[existingSnapshot.status]}`}>
                  {BOOK_PERIOD_STATUS_LABEL[existingSnapshot.status]}
                  {existingSnapshot.closedAt ? ` · ${formatDate(existingSnapshot.closedAt)}` : ''}
                </span>
              ) : (
                <span className="text-[12px] font-semibold text-muted">Belum ada snapshot tersimpan untuk periode {period}.</span>
              )}
              {canClose && !alreadyClosedThisBranch && (
                closeBlocked ? (
                  <Tooltip label="Pilih cabang terlebih dahulu" side="top">
                    <Button variant="danger" size="sm" icon={<Lock size={14} />} disabled>Tutup Periode</Button>
                  </Tooltip>
                ) : !isPastPeriod ? (
                  <Tooltip label="Hanya periode yang sudah lewat yang bisa ditutup" side="top">
                    <Button variant="danger" size="sm" icon={<Lock size={14} />} disabled>Tutup Periode</Button>
                  </Tooltip>
                ) : (
                  <Button variant="danger" size="sm" icon={<Lock size={14} />} onClick={() => setConfirmClose(true)}>Tutup Periode</Button>
                )
              )}
            </div>
          </SectionCard>
        </>
      )}

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={() => {
          setCloseError(null);
          m.closePeriod.mutate({ period, headers: branchHeader }, {
            onSuccess: () => setConfirmClose(false),
            onError: (err: unknown) => setCloseError({ code: getApiErrorCode(err), message: getApiErrorMessage(err) }),
          });
        }}
        title="Tutup Periode Pembukuan"
        message={`Snapshot akhir untuk periode ${period} akan disimpan permanen dan TIDAK DAPAT dibuka kembali. Pastikan seluruh transaksi periode ini sudah benar.`}
        confirmLabel="Ya, Tutup Periode"
        tone="danger"
        loading={m.closePeriod.isPending}
        closeOnConfirm={false}
      />
    </div>
  );
};

// ── Tab: Ledger ───────────────────────────────────────────────────────────────

const ledgerColumns: Column<BookLedgerRow>[] = [
  { header: 'Tanggal', cell: (t) => formatDate(t.transactionDate) },
  { header: 'Akun Kas', cell: (t) => <span className="font-bold text-ink">{t.cashAccount?.name ?? t.cashAccountId}</span> },
  { header: 'Cabang', cell: (t) => t.branch?.nama ?? '-' },
  { header: 'Sumber', cell: (t) => <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-surface-soft border border-border text-muted">{t.sourceType}</span> },
  { header: 'Keterangan', cell: (t) => <span className="font-semibold text-ink-soft break-words">{t.description || '-'}{t.reversalOfId ? ' (Reversal)' : ''}{t.reversedAt ? ' · Sudah dibalik' : ''}</span> },
  { header: 'Tipe', align: 'center', cell: (t) => (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${t.type === 'IN' ? 'bg-accent-green/15 text-accent-green' : t.type === 'OUT' ? 'bg-semantic-error/15 text-semantic-error' : 'bg-accent-blue/15 text-accent-blue'}`}>
      {t.type}
    </span>
  ) },
  { header: 'Nominal', align: 'right', cell: (t) => (
    <span className={`font-extrabold ${t.type === 'IN' ? 'text-accent-green' : t.type === 'OUT' ? 'text-semantic-error' : 'text-accent-blue'}`}>
      {t.type === 'OUT' ? '- ' : '+ '}{formatCurrency(t.amount)}
    </span>
  ) },
];

const LedgerTab = ({ branchKey, branchHeader, period }: { branchKey: string; branchHeader: Record<string, string> | undefined; period: string }) => {
  const [page, setPage] = useState(1);
  const [cashAccountId, setCashAccountId] = useState('');
  const ledger = useBookLedger(branchKey, { period, page, limit: 20, cashAccountId: cashAccountId || undefined }, branchHeader);
  const { data: cashAccounts = [], isLoading: cashLoading } = useBookCashAccounts(branchKey, { headers: branchHeader });

  return (
    <SectionCard
      title="Buku Kas (Ledger)"
      icon={<BookOpen size={16} />}
      action={<div className="w-56"><CashAccountSelect label="" value={cashAccountId} onChange={(v) => { setCashAccountId(v); setPage(1); }} accounts={cashAccounts} loading={cashLoading} /></div>}
      bodyClassName="p-0 md:p-0"
    >
      {ledger.isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={22} className="animate-spin text-muted" /></div>
      ) : ledger.isError ? (
        <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat ledger.</div>
      ) : (ledger.data?.data ?? []).length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={32} className="text-muted mx-auto mb-3" />
          <p className="font-bold text-ink text-[14px]">Belum ada transaksi pada periode ini.</p>
        </div>
      ) : (
        <>
          <DataTable columns={ledgerColumns} data={ledger.data?.data ?? []} rowKey={(t) => t.id} />
          <div className="px-5 pb-4"><Pagination meta={ledger.data?.meta} page={page} onChange={setPage} /></div>
        </>
      )}
    </SectionCard>
  );
};

// ── Tab: Pengaturan Pajak ────────────────────────────────────────────────────

const retryStatusColumns: Column<RetriedTaxSettlement>[] = [
  { header: 'Order', cell: (r) => r.orderId },
  { header: 'Cabang', cell: (r) => r.branch?.nama ?? '-' },
  { header: 'Provisi Pajak', align: 'right', cell: (r) => formatCurrency(r.taxProvision) },
  { header: 'Status Transfer', align: 'center', cell: (r) => (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${TAX_RESERVE_STATUS_COLOR[r.taxReserveStatus]}`}>
      {TAX_RESERVE_STATUS_LABEL[r.taxReserveStatus]}
    </span>
  ) },
];

/**
 * Form terpisah & di-remount lewat `key` (bukan `useEffect`) setiap kali `readiness.data` berubah,
 * supaya lazy `useState` initializer mengambil setting existing yang benar tanpa perlu sinkronisasi.
 */
const TaxSettingForm = ({
  initial, branchKey, branchHeader, mutationBlocked,
}: {
  initial: TaxReadiness | undefined;
  branchKey: string; branchHeader: Record<string, string> | undefined; mutationBlocked: boolean;
}) => {
  const m = useBookMutations();
  const { data: cashAccounts = [], isLoading: cashLoading } = useBookCashAccounts(branchKey, { headers: branchHeader, enabled: !mutationBlocked });
  const [formError, setFormError] = useState<{ code?: string; message: string } | null>(null);
  const [taxRatePercent, setTaxRatePercent] = useState(() => String(initial?.setting?.taxRatePercent ?? 5));
  const [sourceCashAccountId, setSourceCashAccountId] = useState(() => initial?.setting?.sourceCashAccountId ?? '');
  const [reserveCashAccountId, setReserveCashAccountId] = useState(() => initial?.setting?.reserveCashAccountId ?? '');

  const submitSetting = () => {
    setFormError(null);
    const rate = Number(taxRatePercent.replace(',', '.'));
    if (!sourceCashAccountId || !reserveCashAccountId || Number.isNaN(rate)) return;
    m.updateTaxSetting.mutate(
      { body: { taxRatePercent: rate, sourceCashAccountId, reserveCashAccountId }, headers: branchHeader },
      { onError: (err: unknown) => setFormError({ code: getApiErrorCode(err), message: getApiErrorMessage(err) }) },
    );
  };

  return (
    <SectionCard title="Atur Tarif & Akun Pajak" icon={<Percent size={16} />} subtitle={mutationBlocked ? 'Pilih cabang terlebih dahulu untuk mengatur.' : undefined}>
      {formError && <div className="mb-4"><FinanceErrorBanner code={formError.code} message={formError.message} onDismiss={() => setFormError(null)} /></div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Tarif Pajak (%) <span className="text-primary">*</span></label>
          <input
            type="text"
            inputMode="decimal"
            value={taxRatePercent}
            onChange={(e) => setTaxRatePercent(e.target.value.replace(/[^0-9,.]/g, ''))}
            disabled={mutationBlocked}
            className="w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all disabled:opacity-50"
          />
        </div>
        <CashAccountSelect label="Akun Kas Sumber" required value={sourceCashAccountId} onChange={setSourceCashAccountId} accounts={cashAccounts} loading={cashLoading} disabled={mutationBlocked} />
        <CashAccountSelect label="Akun Kas Cadangan" required value={reserveCashAccountId} onChange={setReserveCashAccountId} accounts={cashAccounts} loading={cashLoading} disabled={mutationBlocked} />
      </div>
      <div className="mt-4">
        <Button
          onClick={submitSetting}
          disabled={mutationBlocked || !sourceCashAccountId || !reserveCashAccountId}
          loading={m.updateTaxSetting.isPending}
        >
          Simpan Pengaturan
        </Button>
      </div>
    </SectionCard>
  );
};

const TaxSettingsTab = ({
  branchKey, branchHeader, isOwner, selectedBranchId, canUpdate, canRetry,
}: {
  branchKey: string; branchHeader: Record<string, string> | undefined;
  isOwner: boolean; selectedBranchId: string | null; canUpdate: boolean; canRetry: boolean;
}) => {
  const readiness = useTaxSettings(branchKey, branchHeader);
  const m = useBookMutations();
  const [confirmRetry, setConfirmRetry] = useState(false);
  const [retryResult, setRetryResult] = useState<RetriedTaxSettlement[] | null>(null);

  const rows = readiness.data ?? [];
  const currentRow = rows.find((r) => r.branch.id === selectedBranchId) ?? (rows.length === 1 ? rows[0] : undefined);
  const mutationBlocked = isOwner && !selectedBranchId;

  return (
    <div className="space-y-6">
      <SectionCard title="Status Kesiapan Pajak per Cabang" icon={<Percent size={16} />}>
        {readiness.isLoading ? (
          <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-muted" /></div>
        ) : rows.length === 0 ? (
          <p className="text-center py-8 text-[12px] text-muted">Belum ada data cabang.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.branch.id} className="p-4 rounded-2xl bg-surface-soft border border-border flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold text-ink text-[13px]">{r.branch.nama}</p>
                  {!r.ready && (
                    <ul className="mt-1 space-y-0.5">
                      {r.missing.map((mi) => (
                        <li key={mi} className="text-[11px] font-semibold text-semantic-error">• {TAX_MISSING_LABEL[mi]}</li>
                      ))}
                    </ul>
                  )}
                  {r.ready && r.setting && (
                    <p className="text-[11px] font-semibold text-muted mt-0.5">
                      {r.setting.taxRatePercent}% · {r.setting.sourceCashAccount?.name} → {r.setting.reserveCashAccount?.name}
                    </p>
                  )}
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${r.ready ? 'bg-semantic-success/10 text-semantic-success' : 'bg-semantic-error/10 text-semantic-error'}`}>
                  {r.ready ? 'Siap' : 'Belum Siap'}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {canUpdate && !readiness.isLoading && (
        <TaxSettingForm
          key={currentRow?.branch.id ?? 'none'}
          initial={currentRow}
          branchKey={branchKey}
          branchHeader={branchHeader}
          mutationBlocked={mutationBlocked}
        />
      )}

      {canRetry && (
        <SectionCard title="Retry Transfer Cadangan Pajak" icon={<RefreshCw size={16} />} subtitle="Mencoba ulang transfer cadangan pajak yang tertunda/gagal untuk cabang terpilih.">
          <div className="flex flex-wrap items-center gap-3">
            {mutationBlocked ? (
              <Tooltip label="Pilih cabang terlebih dahulu" side="top">
                <Button variant="secondary" icon={<RefreshCw size={15} />} disabled>Retry Sekarang</Button>
              </Tooltip>
            ) : (
              <Button variant="secondary" icon={<RefreshCw size={15} />} onClick={() => setConfirmRetry(true)}>Retry Sekarang</Button>
            )}
          </div>
          {retryResult && (
            <div className="mt-4">
              {retryResult.length === 0 ? (
                <p className="text-[12px] font-semibold text-muted">Tidak ada transaksi pending yang perlu diretry.</p>
              ) : (
                <DataTable columns={retryStatusColumns} data={retryResult} rowKey={(r) => r.id} />
              )}
            </div>
          )}
        </SectionCard>
      )}

      <ConfirmDialog
        open={confirmRetry}
        onClose={() => setConfirmRetry(false)}
        onConfirm={() => {
          m.retryTaxReserve.mutate({ headers: branchHeader }, {
            onSuccess: (res) => { setRetryResult(res.data); setConfirmRetry(false); },
          });
        }}
        title="Retry Transfer Cadangan Pajak"
        message="Sistem akan mencoba ulang transfer cadangan pajak yang tertunda pada cabang ini. Kegagalan (mis. saldo kurang) akan ditampilkan per-transaksi, bukan sebagai error."
        confirmLabel="Retry"
        tone="primary"
        loading={m.retryTaxReserve.isPending}
        closeOnConfirm={false}
      />
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const BookPageInner = () => {
  const { can } = usePermissions();
  const { isOwner, selectedBranchId, branchHeader, branchKey } = useBranchScope();

  const [tab, setTab] = useState<Tab>('ringkasan');
  const [periodInput, setPeriodInput] = useState(currentPeriod());
  const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
  const period = PERIOD_RE.test(periodInput) ? periodInput : currentPeriod();

  const TABS: { id: Tab; label: string }[] = [
    { id: 'ringkasan', label: 'Ringkasan' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'pajak', label: 'Pengaturan Pajak' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <PageHeader title="Pembukuan Cabang" description="Ringkasan kas, laba rugi, ledger, dan pengaturan pajak per periode" />

      <div className="grid grid-cols-1 sm:grid-cols-[220px] gap-3">
        <MonthField value={periodInput} onChange={setPeriodInput} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors ${tab === t.id ? 'bg-primary text-white border-primary' : 'bg-surface text-ink-soft border-border hover:border-primary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ringkasan' && (
        <RingkasanTab
          branchKey={branchKey}
          branchHeader={branchHeader}
          period={period}
          isOwner={isOwner}
          selectedBranchId={selectedBranchId}
          canClose={can('BOOK_CLOSE')}
        />
      )}
      {tab === 'ledger' && <LedgerTab branchKey={branchKey} branchHeader={branchHeader} period={period} />}
      {tab === 'pajak' && (
        <TaxSettingsTab
          branchKey={branchKey}
          branchHeader={branchHeader}
          isOwner={isOwner}
          selectedBranchId={selectedBranchId}
          canUpdate={can('TAX_SETTING_UPDATE')}
          canRetry={can('TAX_RESERVE_RETRY')}
        />
      )}
    </div>
  );
};

export const BookPage = () => (
  <RequirePermission code="BOOK_READ">
    <BookPageInner />
  </RequirePermission>
);
