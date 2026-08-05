import { useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, BookOpen, Landmark, Loader2, Lock,
  Percent, RefreshCw, ShieldCheck, TrendingUp, Wallet,
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
  useBookCashSummary, useBookClosePreview, useBookLedger, useBookMutations, useBookPeriod,
  useBookPeriods, useBookProfitSummary, useTaxSettings,
} from './book.hooks';
import {
  isBookPeriodConsolidated, isConsolidatedSummary, TAX_MISSING_LABEL, TAX_RESERVE_STATUS_COLOR, TAX_RESERVE_STATUS_LABEL,
  BOOK_PERIOD_STATUS_COLOR, BOOK_PERIOD_STATUS_LABEL,
  type BookLedgerRow, type BookPeriod, type CashSummaryFields, type ProfitSummaryFields,
  type RetriedTaxSettlement, type TaxReadiness,
} from './book.types';
import { findBookSnapshot } from './book.summary';
import { PendingDealFinalizationNotice } from '@/features/crm/PendingDealFinalizationNotice';

type Tab = 'ringkasan' | 'laporan-tutup-buku' | 'ledger' | 'pajak';
// Snapshot lama belum memiliki pemisahan bonus leasing. Nilainya sengaja boleh null
// agar UI tidak mengubahnya menjadi angka berjalan yang berpotensi menyesatkan.
type ExecutiveSummary = CashSummaryFields
  & Omit<ProfitSummaryFields, 'unitSold' | 'leasingBonusIncome' | 'leasingBonusTaxProvision'>
  & { unitSold: number | null; leasingBonusIncome: number | null; leasingBonusTaxProvision: number | null };

const currentPeriod = () => new Date().toISOString().slice(0, 7);
const idr = (n: number) => formatCurrency(n, { compact: true });

const KpiCard = ({
  label, value, caption, icon: Icon, color,
}: {
  label: string; value: string; caption?: string; icon: typeof Wallet; color: string;
}) => (
  <div className="bg-surface rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between min-h-36">
    <div className="flex items-start justify-between gap-2 mb-3">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted break-words">{label}</span>
      <div className={`w-9 h-9 rounded-xl ${color} text-white flex items-center justify-center shrink-0 shadow-sm`}><Icon size={18} /></div>
    </div>
    <span className="text-xl font-extrabold text-ink break-words">{value}</span>
    {caption && <span className="mt-2 text-[11px] leading-relaxed font-semibold text-muted">{caption}</span>}
  </div>
);

const MetricCard = ({ label, value, note, tone = 'neutral' }: { label: string; value: string; note?: string; tone?: 'positive' | 'negative' | 'neutral' }) => {
  const colors = {
    positive: 'border-semantic-success/30 bg-semantic-success/5 text-semantic-success',
    negative: 'border-semantic-error/25 bg-semantic-error/5 text-semantic-error',
    neutral: 'border-border bg-surface-soft text-ink',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[tone]}`}>
      <p className="text-[11px] uppercase tracking-wide font-extrabold text-muted">{label}</p>
      <p className="mt-1 text-lg font-extrabold">{value}</p>
      {note && <p className="mt-1 text-[11px] leading-relaxed font-semibold text-muted">{note}</p>}
    </div>
  );
};

const RingkasanTab = ({
  branchKey, branchHeader, period, isOwner, selectedBranchId, canClose, onClosed, onViewClosedReport,
}: {
  branchKey: string; branchHeader: Record<string, string> | undefined; period: string;
  isOwner: boolean; selectedBranchId: string | null; canClose: boolean; onClosed: () => void; onViewClosedReport: () => void;
}) => {
  const periods = useBookPeriods(branchKey, { period }, branchHeader);
  const existingSnapshot: BookPeriod | undefined = findBookSnapshot(periods.data, period, isOwner, selectedBranchId);
  const useSnapshot = Boolean(existingSnapshot);
  const snapshot = useBookPeriod(branchKey, useSnapshot ? period : null, branchHeader, Boolean(useSnapshot));
  const liveEnabled = (Boolean(periods.data) || periods.isError) && !useSnapshot;
  const cash = useBookCashSummary(branchKey, { period }, branchHeader, liveEnabled);
  const profit = useBookProfitSummary(branchKey, { period }, branchHeader, liveEnabled);
  const m = useBookMutations();
  const [confirmClose, setConfirmClose] = useState(false);
  const [reviewedTransactions, setReviewedTransactions] = useState(false);
  const [understandPermanent, setUnderstandPermanent] = useState(false);
  const [closeError, setCloseError] = useState<{ code?: string; message: string } | null>(null);

  const cashData = cash.data;
  const profitData = profit.data;
  const liveCash: CashSummaryFields | null = cashData ? (isConsolidatedSummary(cashData) ? cashData.consolidated : cashData) : null;
  const liveProfit: ProfitSummaryFields | null = profitData ? (isConsolidatedSummary(profitData) ? profitData.consolidated : profitData) : null;
  const liveSummary: ExecutiveSummary | null = liveCash && liveProfit ? { ...liveCash, ...liveProfit } : null;
  const snapshotData = snapshot.data && !isBookPeriodConsolidated(snapshot.data) ? snapshot.data : null;
  const summary: ExecutiveSummary | null = useSnapshot ? snapshotData : liveSummary;
  const cashBreakdown = !useSnapshot && cashData && isConsolidatedSummary(cashData) ? cashData.breakdown : null;
  const loading = periods.isLoading || (useSnapshot ? snapshot.isLoading : cash.isLoading || profit.isLoading);
  const isPastPeriod = period < currentPeriod();
  const closeBlocked = isOwner && !selectedBranchId;
  const preview = useBookClosePreview(branchKey, confirmClose && !closeBlocked && !existingSnapshot ? period : null, branchHeader);
  const previewReady = Boolean(preview.data?.canClose && reviewedTransactions && understandPermanent);
  const closedAt = useSnapshot ? snapshotData?.closedAt : existingSnapshot?.closedAt;
  const scopeLabel = useSnapshot ? snapshotData?.branch?.nama : isOwner && !selectedBranchId ? 'Seluruh cabang' : cashData && !isConsolidatedSummary(cashData) ? cashData.branch.nama : 'Cabang terpilih';
  const unitSold = summary?.unitSold;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-4 md:p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[12px]">
            <p><span className="font-bold text-muted">Periode:</span> <span className="font-extrabold text-ink">{period}</span></p>
            <p><span className="font-bold text-muted">Cakupan:</span> <span className="font-extrabold text-ink">{scopeLabel}</span></p>
          </div>
          <span className={`inline-flex px-3 py-1.5 rounded-xl text-[11px] font-extrabold ${useSnapshot ? 'bg-semantic-success/10 text-semantic-success' : 'bg-accent-blue/15 text-accent-blue'}`}>
            {useSnapshot ? 'Snapshot final' : 'Berjalan'}
          </span>
        </div>
        {useSnapshot ? (
          <p className="mt-3 text-[12px] font-semibold text-muted">Angka berasal dari snapshot penutupan{closedAt ? ` pada ${formatDate(closedAt)}` : ''}; perubahan transaksi setelahnya tidak mengubah laporan ini.</p>
        ) : isOwner && !selectedBranchId ? (
          <p className="mt-3 text-[12px] font-semibold text-accent-amber">Konsolidasi ini selalu data berjalan. Pilih satu cabang untuk melihat snapshot final, agar cabang yang sudah dan belum ditutup tidak tercampur.</p>
        ) : (
          <p className="mt-3 text-[12px] font-semibold text-muted">Angka diperbarui dari transaksi yang berjalan pada periode ini.</p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
      ) : snapshot.isError ? (
        <div className="text-center py-16 text-muted font-semibold text-sm">Snapshot periode tidak dapat dimuat.</div>
      ) : (
        <>
          <section>
            <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-muted mb-3">Ikhtisar Utama</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard label="Saldo Akhir" value={formatCurrency(summary?.endingCash ?? 0)} caption="Saldo kas pada akhir periode" icon={Landmark} color="bg-primary" />
              <KpiCard label="Laba Bersih Perusahaan" value={formatCurrency(summary?.companyNetProfit ?? 0)} caption="Setelah pembagian investor dan pajak; belum termasuk beban operasional & payroll" icon={TrendingUp} color="bg-accent-green" />
              <KpiCard label="Pendapatan Penjualan" value={formatCurrency(summary?.salesRevenue ?? 0)} caption="Nilai sales order DEAL pada periode ini" icon={ArrowDownLeft} color="bg-accent-green" />
              <KpiCard label="Unit Terjual" value={unitSold === null || unitSold === undefined ? '—' : String(unitSold)} caption={unitSold === null || unitSold === undefined ? 'Tidak tersedia pada snapshot lama' : 'Jumlah sales order DEAL'} icon={ShieldCheck} color="bg-accent-blue" />
            </div>
          </section>

          <SectionCard title="Penjualan & Margin" icon={<TrendingUp size={16} />} subtitle="Margin menunjukkan hasil penjualan sebelum pembagian, pajak, dan beban operasional.">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <MetricCard label="Pendapatan Penjualan" value={idr(summary?.salesRevenue ?? 0)} tone="positive" />
              <MetricCard label="Pendapatan Bonus Leasing" value={idr(summary?.leasingBonusIncome ?? 0)} note="Bonus leasing diterima pada periode ini; bukan harga jual unit" tone="positive" />
              <MetricCard label="HPP Unit" value={idr(summary?.unitHpp ?? 0)} note="Harga pokok unit yang terjual" tone="negative" />
              <MetricCard label="Laba Kotor" value={idr(summary?.grossProfit ?? 0)} note="Penjualan − HPP" tone="positive" />
            </div>
          </SectionCard>

          <SectionCard title="Beban dan Pembagian" icon={<ArrowUpRight size={16} />} subtitle="Pengurang laba yang tercatat dari aktivitas operasional dan settlement penjualan.">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <MetricCard label="Beban Operasional" value={idr(summary?.operationalExpense ?? 0)} tone="negative" />
              <MetricCard label="Beban Payroll" value={idr(summary?.payrollExpense ?? 0)} tone="negative" />
              <MetricCard label="Laba Investor" value={idr(summary?.investorProfit ?? 0)} tone="negative" />
              <MetricCard label="Fixed Return Investor" value={idr(summary?.fixedReturnExpense ?? 0)} tone="negative" />
              <MetricCard label="Rekondisi Tambahan" value={idr(summary?.additionalReconditioningCost ?? 0)} tone="negative" />
              <MetricCard label="Insentif Sales" value={idr(summary?.salesIncentiveAccrued ?? 0)} note="Akrual dari settlement" tone="negative" />
            </div>
          </SectionCard>

          <SectionCard title="Hasil Akhir" icon={<Landmark size={16} />} subtitle="Metrik akhir dibaca setelah seluruh komponen pengurang pada masing-masing tahap diperhitungkan.">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MetricCard label="Provisi Pajak" value={idr(summary?.taxProvision ?? 0)} note={`Dana pajak yang dicadangkan; termasuk pajak bonus ${idr(summary?.leasingBonusTaxProvision ?? 0)}`} tone="negative" />
              <MetricCard label="Laba Bersih Perusahaan" value={idr(summary?.companyNetProfit ?? 0)} note="Setelah pembagian investor dan pajak" tone="positive" />
              <MetricCard label="Laba Bersih Operasional" value={idr(summary?.operationalNetProfit ?? 0)} note="Laba bersih perusahaan − beban operasional − payroll" tone="positive" />
            </div>
          </SectionCard>

          {cashBreakdown && cashBreakdown.length > 0 && (
            <SectionCard title="Rincian Kas per Cabang" icon={<Landmark size={16} />} subtitle="Konsolidasi kas berjalan per cabang; transfer internal tidak dijumlahkan sebagai kas masuk/keluar konsolidasi." bodyClassName="p-0 md:p-0">
              <DataTable
                columns={[
                  { header: 'Cabang', cell: (row) => <span className="font-bold text-ink">{row.branch?.nama}</span> },
                  { header: 'Saldo Awal', align: 'right', cell: (row) => idr(row.openingCash) },
                  { header: 'Kas Masuk', align: 'right', cell: (row) => idr(row.cashIn) },
                  { header: 'Kas Keluar', align: 'right', cell: (row) => idr(row.cashOut) },
                  { header: 'Saldo Akhir', align: 'right', cell: (row) => idr(row.endingCash) },
                ]}
                data={cashBreakdown}
                rowKey={(row) => row.branch.id}
              />
            </SectionCard>
          )}

          <SectionCard title="Status dan Penutupan Periode" icon={<Lock size={16} />} subtitle="Penutupan menyimpan snapshot akhir secara permanen dan tidak dapat dibuka kembali.">
            {closeError && <div className="mb-4"><FinanceErrorBanner code={closeError.code} message={closeError.message} onDismiss={() => setCloseError(null)} /></div>}
            <div className="flex flex-wrap items-center gap-3">
              {existingSnapshot ? (
                <span className={`inline-flex px-3 py-1.5 rounded-xl text-[11px] font-bold ${BOOK_PERIOD_STATUS_COLOR[existingSnapshot.status]}`}>
                  {BOOK_PERIOD_STATUS_LABEL[existingSnapshot.status]}{existingSnapshot.closedAt ? ` · ${formatDate(existingSnapshot.closedAt)}` : ''}
                </span>
              ) : <span className="text-[12px] font-semibold text-muted">Belum ada snapshot tersimpan untuk periode {period}.</span>}
              {existingSnapshot && <Button variant="secondary" size="sm" icon={<BookOpen size={14} />} onClick={onViewClosedReport}>Lihat Laporan Tutup Buku</Button>}
              {canClose && !existingSnapshot && (
                closeBlocked ? <Tooltip label="Pilih cabang terlebih dahulu" side="top"><Button variant="danger" size="sm" icon={<Lock size={14} />} disabled>Tutup Periode</Button></Tooltip>
                  : !isPastPeriod ? <Tooltip label="Hanya periode yang sudah lewat yang bisa ditutup" side="top"><Button variant="danger" size="sm" icon={<Lock size={14} />} disabled>Tutup Periode</Button></Tooltip>
                    : <Button variant="danger" size="sm" icon={<Lock size={14} />} onClick={() => { setReviewedTransactions(false); setUnderstandPermanent(false); setConfirmClose(true); }}>Tinjau sebelum menutup</Button>
              )}
            </div>
          </SectionCard>
        </>
      )}

      <ConfirmDialog
        open={confirmClose}
        onClose={() => { setConfirmClose(false); setCloseError(null); }}
        onConfirm={() => {
          setCloseError(null);
          m.closePeriod.mutate({ period, headers: branchHeader }, {
            onSuccess: () => { setConfirmClose(false); onClosed(); },
            onError: (err: unknown) => setCloseError({ code: getApiErrorCode(err), message: getApiErrorMessage(err) }),
          });
        }}
        title="Tinjau Penutupan Periode"
        message={`Tinjau snapshot untuk ${period} sebelum menyimpannya sebagai laporan final. Angka dapat berubah bila ada transaksi baru sebelum tombol akhir ditekan.`}
        confirmLabel="Tutup Periode Permanen"
        tone="danger"
        loading={m.closePeriod.isPending}
        confirmDisabled={!previewReady || preview.isLoading || preview.isError}
        closeOnConfirm={false}
      >
        {preview.isLoading ? <div className="py-5 flex justify-center"><Loader2 size={20} className="animate-spin text-muted" /></div>
          : preview.isError ? <FinanceErrorBanner code={getApiErrorCode(preview.error)} message={getApiErrorMessage(preview.error)} onDismiss={() => setConfirmClose(false)} />
            : preview.data && <div className="space-y-4">
              <div className="rounded-xl bg-surface-soft border border-border p-3 text-[12px] font-semibold text-muted text-left"><strong className="text-ink">{preview.data.branch.nama}</strong> · Periode {preview.data.period}</div>
              <div className="grid grid-cols-2 gap-2 text-left">
                <MetricCard label="Saldo Akhir" value={idr(preview.data.summary.endingCash)} tone="neutral" />
                <MetricCard label="Penjualan" value={idr(preview.data.summary.salesRevenue)} tone="positive" />
                <MetricCard label="Unit Terjual" value={String(preview.data.summary.unitSold)} tone="neutral" />
                <MetricCard label="Laba Bersih Operasional" value={idr(preview.data.summary.operationalNetProfit)} tone="positive" />
              </div>
              <div className="space-y-2 text-left">{preview.data.checks.map((check) => <p key={check.code} className={`text-[12px] font-semibold ${check.status === 'READY' ? 'text-semantic-success' : check.status === 'WARNING' ? 'text-accent-amber' : 'text-semantic-error'}`}>• {check.message}</p>)}</div>
              <label className="flex gap-2.5 items-start text-left cursor-pointer"><input type="checkbox" checked={reviewedTransactions} onChange={(event) => setReviewedTransactions(event.target.checked)} className="mt-0.5 accent-primary" /><span className="text-[12px] font-semibold text-ink-soft">Saya telah meninjau transaksi dan angka ringkasan periode ini.</span></label>
              <label className="flex gap-2.5 items-start text-left cursor-pointer"><input type="checkbox" checked={understandPermanent} onChange={(event) => setUnderstandPermanent(event.target.checked)} className="mt-0.5 accent-primary" /><span className="text-[12px] font-semibold text-ink-soft">Saya memahami periode yang ditutup tidak dapat dibuka kembali.</span></label>
              {closeError && <FinanceErrorBanner code={closeError.code} message={closeError.message} onDismiss={() => setCloseError(null)} />}
            </div>}
      </ConfirmDialog>
    </div>
  );
};

const LaporanTutupBukuTab = ({
  branchKey, branchHeader, period, isOwner, selectedBranchId, onOpenSummary,
}: {
  branchKey: string; branchHeader: Record<string, string> | undefined; period: string;
  isOwner: boolean; selectedBranchId: string | null; onOpenSummary: () => void;
}) => {
  const hasConcreteBranch = !isOwner || !!selectedBranchId;
  const snapshotQuery = useBookPeriod(branchKey, hasConcreteBranch ? period : null, branchHeader, hasConcreteBranch);
  const snapshot = snapshotQuery.data && !isBookPeriodConsolidated(snapshotQuery.data) ? snapshotQuery.data : null;
  const unitSold = snapshot?.unitSold;

  if (!hasConcreteBranch) return <SectionCard title="Laporan Tutup Buku" icon={<Lock size={16} />} subtitle="Laporan final selalu dibuat per cabang."><p className="text-[13px] font-semibold text-accent-amber">Pilih satu cabang untuk membuka snapshot final periode ini. Konsolidasi tidak digunakan agar snapshot cabang yang sudah dan belum ditutup tidak tercampur.</p></SectionCard>;
  if (snapshotQuery.isLoading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>;
  if (snapshotQuery.isError || !snapshot) return <SectionCard title="Laporan Tutup Buku" icon={<Lock size={16} />} subtitle="Belum ada snapshot final untuk periode dan cabang ini."><div className="flex flex-wrap items-center gap-3"><p className="text-[13px] font-semibold text-muted">Tutup periode dari tab Ringkasan setelah seluruh angka ditinjau.</p><Button variant="secondary" size="sm" onClick={onOpenSummary}>Buka Ringkasan</Button></div></SectionCard>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-semantic-success/25 bg-semantic-success/5 p-4 md:p-5">
        <div className="flex flex-wrap justify-between items-start gap-3"><div><p className="text-[11px] uppercase tracking-wide font-extrabold text-semantic-success">Snapshot final</p><h3 className="mt-1 text-lg font-extrabold text-ink">Laporan Tutup Buku · {snapshot.period}</h3><p className="mt-1 text-[12px] font-semibold text-muted">{snapshot.branch?.nama ?? 'Cabang'}{snapshot.closedAt ? ` · Ditutup ${formatDate(snapshot.closedAt)}` : ''}{snapshot.closedBy?.name ? ` oleh ${snapshot.closedBy.name}` : ''}</p></div><span className={`inline-flex px-3 py-1.5 rounded-xl text-[11px] font-extrabold ${BOOK_PERIOD_STATUS_COLOR[snapshot.status]}`}>{BOOK_PERIOD_STATUS_LABEL[snapshot.status]}</span></div>
        <p className="mt-3 text-[12px] font-semibold text-muted">Angka ini disimpan saat penutupan. Transaksi yang berubah setelahnya tidak memengaruhi laporan.</p>
      </div>

      <section><h3 className="text-[13px] font-extrabold uppercase tracking-wide text-muted mb-3">Kas</h3><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"><MetricCard label="Saldo Awal" value={idr(snapshot.openingCash)} /><MetricCard label="Kas Masuk" value={idr(snapshot.cashIn)} tone="positive" /><MetricCard label="Kas Keluar" value={idr(snapshot.cashOut)} tone="negative" /><MetricCard label="Saldo Akhir" value={idr(snapshot.endingCash)} tone="positive" /></div></section>
      <SectionCard title="Penjualan & Margin" icon={<TrendingUp size={16} />} subtitle="Angka penjualan dan margin yang disimpan saat penutupan."><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3"><MetricCard label="Pendapatan Penjualan" value={idr(snapshot.salesRevenue)} tone="positive" /><MetricCard label="Bonus Leasing" value={snapshot.leasingBonusIncome === null ? '—' : idr(snapshot.leasingBonusIncome)} note={snapshot.leasingBonusIncome === null ? 'Tidak tersedia pada snapshot lama' : 'Pendapatan tambahan, bukan harga jual unit'} tone="positive" /><MetricCard label="Unit Terjual" value={unitSold === null ? '—' : String(unitSold)} note={unitSold === null ? 'Tidak tersedia pada snapshot lama' : undefined} /><MetricCard label="HPP Unit" value={idr(snapshot.unitHpp)} tone="negative" /><MetricCard label="Laba Kotor" value={idr(snapshot.grossProfit)} note="Penjualan − HPP" tone="positive" /></div></SectionCard>
      <SectionCard title="Beban & Pembagian" icon={<ArrowUpRight size={16} />} subtitle="Komponen pengurang dan pembagian yang tercatat di snapshot."><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"><MetricCard label="Beban Operasional" value={idr(snapshot.operationalExpense)} tone="negative" /><MetricCard label="Beban Payroll" value={idr(snapshot.payrollExpense)} tone="negative" /><MetricCard label="Laba Investor" value={idr(snapshot.investorProfit)} tone="negative" /><MetricCard label="Fixed Return Investor" value={idr(snapshot.fixedReturnExpense)} tone="negative" /><MetricCard label="Rekondisi Tambahan" value={idr(snapshot.additionalReconditioningCost)} tone="negative" /><MetricCard label="Insentif Sales" value={idr(snapshot.salesIncentiveAccrued)} tone="negative" /></div></SectionCard>
      <SectionCard title="Hasil Akhir" icon={<Landmark size={16} />} subtitle="Hasil akhir snapshot setelah komponen settlement dan biaya terkait."><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><MetricCard label="Provisi Pajak" value={idr(snapshot.taxProvision)} note={snapshot.leasingBonusTaxProvision === null ? 'Rincian bonus tidak tersedia pada snapshot lama' : `Termasuk pajak bonus ${idr(snapshot.leasingBonusTaxProvision)}`} tone="negative" /><MetricCard label="Laba Bersih Perusahaan" value={idr(snapshot.companyNetProfit)} tone="positive" /><MetricCard label="Laba Bersih Operasional" value={idr(snapshot.operationalNetProfit)} note="Setelah beban operasional dan payroll" tone="positive" /></div></SectionCard>
    </div>
  );
};

const LEDGER_SOURCE_LABEL: Record<string, string> = {
  UNIT_PURCHASE: 'Pembelian Unit', REKONDISI: 'Rekondisi Unit', LEAD_PAYMENT: 'Pembayaran Pelanggan', LEASING_BONUS: 'Bonus Leasing',
  OPERATIONAL: 'Pengeluaran Operasional', PAYROLL: 'Payroll', INVESTOR_MODAL: 'Modal Investor',
  INVESTOR_CAPITAL_DEPOSIT: 'Setoran Modal Investor', INVESTOR_CAPITAL_WITHDRAWAL: 'Penarikan Modal Investor',
  INVESTOR_OBLIGATION_PAYMENT: 'Pembayaran Kewajiban Investor', TAX_RESERVE_TRANSFER: 'Transfer Cadangan Pajak',
  MANUAL_ADJUSTMENT: 'Penyesuaian Manual', TRANSFER: 'Transfer Antar Akun',
  INTER_BRANCH_TRANSFER: 'Transfer Antar Cabang', REVERSAL: 'Pembalikan Transaksi',
};

const ledgerPresentation = (type: BookLedgerRow['type']) => type === 'IN'
  ? { label: 'Masuk', amountPrefix: '+ ', color: 'bg-accent-green/15 text-accent-green' }
  : type === 'OUT'
    ? { label: 'Keluar', amountPrefix: '− ', color: 'bg-semantic-error/15 text-semantic-error' }
    : { label: 'Transfer Internal', amountPrefix: '', color: 'bg-surface-soft text-muted' };

const ledgerColumns: Column<BookLedgerRow>[] = [
  { header: 'Tanggal', cell: (transaction) => formatDate(transaction.transactionDate) },
  { header: 'Akun Kas', cell: (transaction) => <span className="font-bold text-ink">{transaction.cashAccount?.name ?? transaction.cashAccountId}</span> },
  { header: 'Cabang', cell: (transaction) => transaction.branch?.nama ?? '-' },
  { header: 'Sumber', cell: (transaction) => <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-surface-soft border border-border text-muted">{LEDGER_SOURCE_LABEL[transaction.sourceType] ?? transaction.sourceType}</span> },
  { header: 'Keterangan', cell: (transaction) => (
    <div className="flex flex-wrap gap-1.5 items-center"><span className="font-semibold text-ink-soft break-words">{transaction.description || '-'}</span>
      {transaction.reversalOfId && <span className="px-1.5 py-0.5 rounded bg-semantic-error/10 text-semantic-error text-[10px] font-extrabold">Pembalikan</span>}
      {transaction.reversedAt && <span className="px-1.5 py-0.5 rounded bg-accent-amber/15 text-accent-amber text-[10px] font-extrabold">Sudah dibalik</span>}
    </div>
  ) },
  { header: 'Arti Transaksi', align: 'center', cell: (transaction) => {
    const presentation = ledgerPresentation(transaction.type);
    return <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${presentation.color}`}>{presentation.label}</span>;
  } },
  { header: 'Nominal', align: 'right', cell: (transaction) => {
    const presentation = ledgerPresentation(transaction.type);
    return <span className={`font-extrabold ${transaction.type === 'IN' ? 'text-accent-green' : transaction.type === 'OUT' ? 'text-semantic-error' : 'text-muted'}`}>{presentation.amountPrefix}{formatCurrency(transaction.amount)}</span>;
  } },
];

const LedgerTab = ({ branchKey, branchHeader, period }: { branchKey: string; branchHeader: Record<string, string> | undefined; period: string }) => {
  const [page, setPage] = useState(1);
  const [cashAccountId, setCashAccountId] = useState('');
  const ledger = useBookLedger(branchKey, { period, page, limit: 20, cashAccountId: cashAccountId || undefined }, branchHeader);
  const { data: cashAccounts = [], isLoading: cashLoading } = useBookCashAccounts(branchKey, { headers: branchHeader });
  return (
    <SectionCard
      title="Arus Kas (Ledger)"
      icon={<BookOpen size={16} />}
      subtitle="Ledger mencatat arus kas, bukan laba rugi. Transfer internal bukan pendapatan atau beban."
      action={<div className="w-64"><CashAccountSelect label="Filter Akun Kas" value={cashAccountId} onChange={(value) => { setCashAccountId(value); setPage(1); }} accounts={cashAccounts} loading={cashLoading} /></div>}
      bodyClassName="p-0 md:p-0"
    >
      {ledger.isLoading ? <div className="flex items-center justify-center py-16"><Loader2 size={22} className="animate-spin text-muted" /></div>
        : ledger.isError ? <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat ledger.</div>
          : (ledger.data?.data ?? []).length === 0 ? <div className="text-center py-16"><BookOpen size={32} className="text-muted mx-auto mb-3" /><p className="font-bold text-ink text-[14px]">Belum ada transaksi pada periode ini.</p></div>
            : <><DataTable columns={ledgerColumns} data={ledger.data?.data ?? []} rowKey={(transaction) => transaction.id} /><div className="px-5 pb-4"><Pagination meta={ledger.data?.meta} page={page} onChange={setPage} /></div></>}
    </SectionCard>
  );
};

const retryStatusColumns: Column<RetriedTaxSettlement>[] = [
  { header: 'Order', cell: (row) => row.orderId },
  { header: 'Cabang', cell: (row) => row.branch?.nama ?? '-' },
  { header: 'Provisi Pajak', align: 'right', cell: (row) => formatCurrency(row.taxProvision) },
  { header: 'Status Transfer', align: 'center', cell: (row) => <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${TAX_RESERVE_STATUS_COLOR[row.taxReserveStatus]}`}>{TAX_RESERVE_STATUS_LABEL[row.taxReserveStatus]}</span> },
];

const TaxSettingForm = ({ initial, branchKey, branchHeader, mutationBlocked }: { initial: TaxReadiness | undefined; branchKey: string; branchHeader: Record<string, string> | undefined; mutationBlocked: boolean }) => {
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
    m.updateTaxSetting.mutate({ body: { taxRatePercent: rate, sourceCashAccountId, reserveCashAccountId }, headers: branchHeader }, { onError: (error: unknown) => setFormError({ code: getApiErrorCode(error), message: getApiErrorMessage(error) }) });
  };
  return (
    <SectionCard title="Atur Tarif & Alur Dana Pajak" icon={<Percent size={16} />} subtitle={mutationBlocked ? 'Pilih cabang terlebih dahulu untuk mengatur.' : 'Kas sumber adalah akun yang dipotong; kas cadangan menampung provisi sebelum pembayaran pajak.'}>
      {formError && <div className="mb-4"><FinanceErrorBanner code={formError.code} message={formError.message} onDismiss={() => setFormError(null)} /></div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Tarif Pajak (%) <span className="text-primary">*</span></label><input type="text" inputMode="decimal" value={taxRatePercent} onChange={(event) => setTaxRatePercent(event.target.value.replace(/[^0-9,.]/g, ''))} disabled={mutationBlocked} className="w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all disabled:opacity-50" /></div>
        <CashAccountSelect label="Akun Kas Sumber" required value={sourceCashAccountId} onChange={setSourceCashAccountId} accounts={cashAccounts} loading={cashLoading} disabled={mutationBlocked} />
        <CashAccountSelect label="Akun Kas Cadangan" required value={reserveCashAccountId} onChange={setReserveCashAccountId} accounts={cashAccounts} loading={cashLoading} disabled={mutationBlocked} />
      </div>
      <div className="mt-4"><Button onClick={submitSetting} disabled={mutationBlocked || !sourceCashAccountId || !reserveCashAccountId} loading={m.updateTaxSetting.isPending}>Simpan Pengaturan</Button></div>
    </SectionCard>
  );
};

const TaxSettingsTab = ({ branchKey, branchHeader, isOwner, selectedBranchId, canUpdate, canRetry }: { branchKey: string; branchHeader: Record<string, string> | undefined; isOwner: boolean; selectedBranchId: string | null; canUpdate: boolean; canRetry: boolean }) => {
  const readiness = useTaxSettings(branchKey, branchHeader);
  const m = useBookMutations();
  const [confirmRetry, setConfirmRetry] = useState(false);
  const [retryResult, setRetryResult] = useState<RetriedTaxSettlement[] | null>(null);
  const rows = readiness.data ?? [];
  const currentRow = rows.find((row) => row.branch.id === selectedBranchId) ?? (rows.length === 1 ? rows[0] : undefined);
  const mutationBlocked = isOwner && !selectedBranchId;
  return (
    <div className="space-y-6">
      <SectionCard title="Kesiapan Cadangan Pajak" icon={<Percent size={16} />} subtitle="Status menunjukkan apakah tarif serta alur akun sumber → akun cadangan sudah siap dipakai.">
        {readiness.isLoading ? <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-muted" /></div>
          : rows.length === 0 ? <p className="text-center py-8 text-[12px] text-muted">Belum ada data cabang.</p>
            : <div className="space-y-3">{rows.map((row) => <div key={row.branch.id} className="p-4 rounded-2xl bg-surface-soft border border-border flex flex-wrap items-center justify-between gap-3"><div><p className="font-extrabold text-ink text-[13px]">{row.branch.nama}</p>{!row.ready ? <ul className="mt-1 space-y-0.5">{row.missing.map((missing) => <li key={missing} className="text-[11px] font-semibold text-semantic-error">• {TAX_MISSING_LABEL[missing]}</li>)}</ul> : <p className="text-[11px] font-semibold text-muted mt-0.5">Tarif {row.setting?.taxRatePercent}% · {row.setting?.sourceCashAccount?.name} → {row.setting?.reserveCashAccount?.name}</p>}</div><span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${row.ready ? 'bg-semantic-success/10 text-semantic-success' : 'bg-semantic-error/10 text-semantic-error'}`}>{row.ready ? 'Siap' : 'Belum Siap'}</span></div>)}</div>}
      </SectionCard>
      {canUpdate && !readiness.isLoading && <TaxSettingForm key={currentRow?.branch.id ?? 'none'} initial={currentRow} branchKey={branchKey} branchHeader={branchHeader} mutationBlocked={mutationBlocked} />}
      {canRetry && <SectionCard title="Retry Transfer Cadangan Pajak" icon={<RefreshCw size={16} />} subtitle="Mencoba ulang transfer yang tertunda atau gagal untuk cabang terpilih; hasil tiap transaksi ditampilkan di bawah."><div className="flex flex-wrap items-center gap-3">{mutationBlocked ? <Tooltip label="Pilih cabang terlebih dahulu" side="top"><Button variant="secondary" icon={<RefreshCw size={15} />} disabled>Retry Sekarang</Button></Tooltip> : <Button variant="secondary" icon={<RefreshCw size={15} />} onClick={() => setConfirmRetry(true)}>Retry Sekarang</Button>}</div>{retryResult && <div className="mt-4">{retryResult.length === 0 ? <p className="text-[12px] font-semibold text-muted">Tidak ada transaksi pending yang perlu diretry.</p> : <DataTable columns={retryStatusColumns} data={retryResult} rowKey={(row) => row.id} />}</div>}</SectionCard>}
      <ConfirmDialog open={confirmRetry} onClose={() => setConfirmRetry(false)} onConfirm={() => { m.retryTaxReserve.mutate({ headers: branchHeader }, { onSuccess: (result) => { setRetryResult(result.data); setConfirmRetry(false); } }); }} title="Retry Transfer Cadangan Pajak" message="Sistem akan mencoba ulang transfer cadangan pajak yang tertunda pada cabang ini. Kegagalan, misalnya saldo kurang, ditampilkan per transaksi." confirmLabel="Retry" tone="primary" loading={m.retryTaxReserve.isPending} closeOnConfirm={false} />
    </div>
  );
};

const BookPageInner = () => {
  const { can } = usePermissions();
  const { isOwner, selectedBranchId, branchHeader, branchKey } = useBranchScope();
  const [tab, setTab] = useState<Tab>('ringkasan');
  const [periodInput, setPeriodInput] = useState(currentPeriod());
  const period = /^\d{4}-(0[1-9]|1[0-2])$/.test(periodInput) ? periodInput : currentPeriod();
  const tabs: { id: Tab; label: string }[] = [{ id: 'ringkasan', label: 'Ringkasan' }, { id: 'laporan-tutup-buku', label: 'Laporan Tutup Buku' }, { id: 'ledger', label: 'Ledger' }, { id: 'pajak', label: 'Pengaturan Pajak' }];
  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <PageHeader title="Pembukuan Cabang" description="Ringkasan kas dan laba yang membedakan data berjalan dari snapshot periode final." />
      <PendingDealFinalizationNotice branchKey={branchKey} headers={branchHeader} />
      <div className="grid grid-cols-1 sm:grid-cols-[220px] gap-3"><MonthField value={periodInput} onChange={setPeriodInput} /></div>
      <div className="flex items-center gap-2 flex-wrap">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors ${tab === item.id ? 'bg-primary text-white border-primary' : 'bg-surface text-ink-soft border-border hover:border-primary'}`}>{item.label}</button>)}</div>
      {tab === 'ringkasan' && <RingkasanTab branchKey={branchKey} branchHeader={branchHeader} period={period} isOwner={isOwner} selectedBranchId={selectedBranchId} canClose={can('BOOK_CLOSE')} onClosed={() => setTab('laporan-tutup-buku')} onViewClosedReport={() => setTab('laporan-tutup-buku')} />}
      {tab === 'laporan-tutup-buku' && <LaporanTutupBukuTab branchKey={branchKey} branchHeader={branchHeader} period={period} isOwner={isOwner} selectedBranchId={selectedBranchId} onOpenSummary={() => setTab('ringkasan')} />}
      {tab === 'ledger' && <LedgerTab branchKey={branchKey} branchHeader={branchHeader} period={period} />}
      {tab === 'pajak' && <TaxSettingsTab branchKey={branchKey} branchHeader={branchHeader} isOwner={isOwner} selectedBranchId={selectedBranchId} canUpdate={can('TAX_SETTING_UPDATE')} canRetry={can('TAX_RESERVE_RETRY')} />}
    </div>
  );
};

export const BookPage = () => <RequirePermission code="BOOK_READ"><BookPageInner /></RequirePermission>;
