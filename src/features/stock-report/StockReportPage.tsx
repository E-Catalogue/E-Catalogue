import { useMemo, useState } from 'react';
import {
  PackageSearch, Boxes, Wallet, TrendingUp, Timer, AlertTriangle, Layers,
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { SelectField } from '@/shared/components/ui/Field';
import { formatCurrency, formatNumber, formatDate } from '@/core/utils/format';
import { businessToday } from '@/core/utils/businessDate';
import { useStockOverview, useStockUnits, useStockMovements } from './stock-report.hooks';
import type { StockUnitRow, StockMovement, BranchComparison } from './stock-report.types';

const today = businessToday;

const BADGE_CLS: Record<string, string> = {
  Normal: 'bg-accent-green/10 text-accent-green',
  'Perlu Perhatian': 'bg-accent-amber/10 text-accent-amber',
  Kritis: 'bg-semantic-error/10 text-semantic-error',
  'Belum Ready': 'bg-muted/10 text-muted',
};
const STATUS_CLS: Record<string, string> = {
  INVENTORY: 'bg-muted/10 text-muted',
  READY_STOCK: 'bg-accent-green/10 text-accent-green',
  HOLD: 'bg-accent-amber/10 text-accent-amber',
};
const MOVE_META: Record<string, { cls: string; Icon: typeof ArrowDownToLine }> = {
  IN: { cls: 'bg-accent-blue/10 text-accent-blue', Icon: ArrowDownToLine },
  SOLD: { cls: 'bg-accent-green/10 text-accent-green', Icon: ArrowUpFromLine },
  TRANSFER: { cls: 'bg-primary/10 text-primary', Icon: ArrowLeftRight },
  STATUS_CHANGE: { cls: 'bg-accent-amber/10 text-accent-amber', Icon: RefreshCw },
};
const SLOW_ACTIONS = ['Promosi', 'Review Harga', 'Rekondisi', 'Transfer Cabang', 'Evaluasi Pembelian'];
const idr = (n?: number | null) => (n == null ? '—' : formatCurrency(n, { compact: true }));

const Kpi = ({ icon: Icon, label, value, tone = 'ink', sub }: { icon: typeof Boxes; label: string; value: string; tone?: 'ink' | 'primary' | 'green' | 'amber' | 'error'; sub?: string }) => {
  const toneCls = { ink: 'text-ink', primary: 'text-primary', green: 'text-accent-green', amber: 'text-accent-amber', error: 'text-semantic-error' }[tone];
  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center"><Icon size={16} /></span>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p></div>
      <p className={`text-xl font-extrabold ${toneCls}`}>{value}</p>
      {sub && <p className="text-[11px] font-semibold text-muted mt-0.5">{sub}</p>}
    </div>
  );
};

type Tab = 'aging' | 'slow_moving' | 'valuation';
const TABS: { key: Tab; label: string }[] = [
  { key: 'aging', label: 'Aging Stock' },
  { key: 'slow_moving', label: 'Slow Moving' },
  { key: 'valuation', label: 'Valuasi & Pergerakan' },
];

export const StockReportPage = () => {
  const [asOf, setAsOf] = useState(today());
  const [status, setStatus] = useState('');
  const [tab, setTab] = useState<Tab>('aging');
  const [unitPage, setUnitPage] = useState(1);
  const [unitLimit, setUnitLimit] = useState(15);
  const [unitSearch, setUnitSearch] = useState('');
  const [movePage, setMovePage] = useState(1);
  const [moveLimit, setMoveLimit] = useState(20);
  const [moveSearch, setMoveSearch] = useState('');

  const baseParams = { asOf, statusUnit: status || undefined };
  const { data: overview, isLoading: ovLoading } = useStockOverview(baseParams);
  const { data: unitsRes, isLoading: unitsLoading } = useStockUnits({ ...baseParams, view: tab, page: unitPage, limit: unitLimit });
  const { data: movesRes, isLoading: movesLoading } = useStockMovements({ asOf, page: movePage, limit: moveLimit }, tab === 'valuation');

  const rawRows = unitsRes?.data ?? [];
  const filteredRows = useMemo(() => {
    if (!unitSearch.trim()) return rawRows;
    const q = unitSearch.toLowerCase();
    return rawRows.filter((u) => {
      return (
        u.name?.toLowerCase().includes(q) ||
        u.platNomor?.toLowerCase().includes(q) ||
        u.merek?.toLowerCase().includes(q) ||
        u.tipe?.toLowerCase().includes(q) ||
        u.branch?.nama?.toLowerCase().includes(q) ||
        u.statusUnit?.toLowerCase().includes(q) ||
        u.badge?.toLowerCase().includes(q)
      );
    });
  }, [rawRows, unitSearch]);

  const rawMoves = movesRes?.data ?? [];
  const filteredMoves = useMemo(() => {
    if (!moveSearch.trim()) return rawMoves;
    const q = moveSearch.toLowerCase();
    return rawMoves.filter((m) => {
      return (
        m.unitName?.toLowerCase().includes(q) ||
        m.platNomor?.toLowerCase().includes(q) ||
        m.label?.toLowerCase().includes(q) ||
        m.detail?.toLowerCase().includes(q) ||
        m.type?.toLowerCase().includes(q)
      );
    });
  }, [rawMoves, moveSearch]);

  const maxBucket = Math.max(1, ...(overview?.aging.map((a) => a.count) ?? [1]));

  const unitColumns: Column<StockUnitRow>[] = [
    { header: 'Unit', cell: (u) => <div className="min-w-0"><p className="font-bold text-ink text-[13px] truncate">{u.name}</p><p className="text-[11px] text-muted font-medium truncate">{[u.merek, u.tipe].filter(Boolean).join(' ')} · {u.platNomor}</p></div> },
    { header: 'Cabang', cell: (u) => <span className="text-[12px] font-semibold text-muted">{u.branch?.nama ?? '—'}</span> },
    { header: 'Status', align: 'center', cell: (u) => <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_CLS[u.statusUnit] ?? ''}`}>{u.statusUnit}</span> },
    { header: 'Umur', align: 'right', cell: (u) => <span className="text-[12px] font-bold text-ink">{u.ageDays == null ? 'Belum Ready' : `${u.ageDays} hari`}</span> },
    { header: 'HPP', align: 'right', cell: (u) => <span className="font-bold text-ink text-[13px]">{idr(u.hpp)}</span> },
    { header: 'Harga Jual', align: 'right', cell: (u) => <span className="font-bold text-primary text-[13px]">{idr(u.hargaJual)}</span> },
    { header: 'Margin', align: 'right', cell: (u) => <span className={`font-bold text-[13px] ${(u.margin ?? 0) < 0 ? 'text-semantic-error' : 'text-accent-green'}`}>{idr(u.margin)}</span> },
    { header: 'Badge', align: 'center', cell: (u) => <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${BADGE_CLS[u.badge] ?? ''}`}>{u.badge}</span> },
  ];

  const branchColumns: Column<BranchComparison>[] = [
    { header: 'Cabang', cell: (b) => <span className="font-bold text-ink text-[13px]">{b.nama}</span> },
    { header: 'Stok Aktif', align: 'right', cell: (b) => <span className="font-bold text-ink text-[13px]">{formatNumber(b.activeCount)}</span> },
    { header: 'Nilai HPP', align: 'right', cell: (b) => <span className="font-bold text-ink text-[13px]">{idr(b.hppValue)}</span> },
    { header: 'Terjual (90h)', align: 'right', cell: (b) => <span className="text-[13px] font-semibold text-muted">{formatNumber(b.soldInRange)}</span> },
    { header: 'Sell-through', align: 'right', cell: (b) => <span className="font-bold text-primary text-[13px]">{Math.round(b.sellThrough * 100)}%</span> },
  ];

  return (
    <div className="max-w-[1280px] mx-auto animate-float-up space-y-5 pb-12">
      <PageHeader title="Laporan Stok" description="Gambaran stok aktif, aging, slow moving, valuasi, dan pergerakan unit."
        action={
          <div className="flex items-end gap-2">
            <div><label className="block text-[10px] font-bold uppercase tracking-wide text-muted mb-1">Per Tanggal</label>
              <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="h-10 px-3 rounded-xl bg-surface border border-border text-[13px] font-semibold focus:outline-none focus:border-primary" /></div>
            <SelectField label="Status" wrapClass="w-36" value={status} onChange={(e) => { setStatus(e.target.value); setUnitPage(1); }}
              options={[{ value: '', label: 'Semua Aktif' }, { value: 'INVENTORY', label: 'Inventory' }, { value: 'READY_STOCK', label: 'Ready Stock' }, { value: 'HOLD', label: 'Hold' }]} />
          </div>
        } />

      {/* KPI */}
      {ovLoading || !overview ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-[92px] rounded-2xl bg-surface border border-border animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          <Kpi icon={Boxes} label="Stok Aktif" value={formatNumber(overview.kpi.totalActive)} sub={`Final ${overview.kpi.finalizedActiveCount} · Belum final ${overview.kpi.unfinalizedActiveCount}`} />
          <Kpi icon={Wallet} label="HPP Sudah Finalisasi" value={idr(overview.kpi.hppFinalizedValue)} />
          <Kpi icon={Wallet} label="HPP Belum Finalisasi" value={idr(overview.kpi.hppUnfinalizedValue)} tone="amber" />
          <Kpi icon={TrendingUp} label="Nilai Jual (Final)" value={idr(overview.kpi.jualValue)} tone="primary" />
          <Kpi icon={Timer} label="Umur Rata-rata (Final)" value={`${overview.kpi.avgAgeDays} hari`} tone={overview.kpi.avgAgeDays > 90 ? 'error' : overview.kpi.avgAgeDays > 60 ? 'amber' : 'ink'} />
          <Kpi icon={AlertTriangle} label="Slow Moving (Final)" value={formatNumber(overview.kpi.slowMovingCount)} tone="amber" />
          <Kpi icon={Layers} label="Potensi Margin (Final)" value={idr(overview.kpi.potentialMargin)} tone="green" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface p-1.5 w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setUnitPage(1); setUnitSearch(''); }}
            className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-bold transition-all ${tab === t.key ? 'bg-primary text-white shadow-glow' : 'text-ink-soft hover:bg-surface-soft'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Aging bucket bars */}
      {tab === 'aging' && overview && (
        <SectionCard title="Distribusi Umur Stock (Ready)" icon={<Timer size={16} />}>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {overview.aging.map((a) => (
              <div key={a.bucket} className="rounded-xl border border-border bg-surface-soft p-3">
                <p className="text-[11px] font-bold text-muted">{a.bucket} hari</p>
                <p className="text-2xl font-extrabold text-ink mt-1">{a.count}</p>
                <div className="h-1.5 rounded-full bg-border mt-2 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(a.count / maxBucket) * 100}%` }} /></div>
                <p className="text-[10px] font-semibold text-muted mt-1.5">{idr(a.hppValue)}</p>
              </div>
            ))}
          </div>
          {overview.belumReady > 0 && <p className="text-[12px] font-semibold text-muted mt-3">+ {overview.belumReady} unit <span className="text-ink">Belum Ready</span> (INVENTORY tanpa tanggal ready) — tidak masuk bucket aging.</p>}
        </SectionCard>
      )}

      {tab === 'slow_moving' && (
        <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/5 p-4">
          <p className="text-[13px] font-bold text-ink flex items-center gap-2"><AlertTriangle size={15} className="text-accent-amber" /> Unit READY &gt; 60 hari tanpa aktivitas lead/test drive 30 hari terakhir.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-[11px] font-bold text-muted">Rekomendasi:</span>
            {SLOW_ACTIONS.map((a) => <span key={a} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-surface border border-border text-ink-soft">{a}</span>)}
          </div>
        </div>
      )}

      {/* Units table */}
      {tab !== 'valuation' && (
        <SectionCard
          title={tab === 'aging' ? 'Daftar Unit (Aging)' : 'Daftar Unit Slow Moving'}
          icon={<PackageSearch size={16} />}
          bodyClassName="p-0 md:p-0"
          action={
            <div className="w-64">
              <SearchInput
                size="sm"
                value={unitSearch}
                onChange={setUnitSearch}
                placeholder="Cari unit, plat, cabang..."
              />
            </div>
          }
        >
          {unitsLoading ? (
            <TableSkeleton rows={6} cols={8} />
          ) : rawRows.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title={tab === 'slow_moving' ? 'Tidak ada unit slow moving' : 'Tidak ada unit'}
              description="Sesuaikan filter atau tanggal."
            />
          ) : filteredRows.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Tidak ada data yang cocok"
              description={`Tidak ditemukan unit dengan kata kunci "${unitSearch}".`}
            />
          ) : (
            <>
              <DataTable columns={unitColumns} data={filteredRows} rowKey={(r) => r.id} />
              <div className="p-4">
                <Pagination
                  meta={unitsRes?.meta}
                  page={unitPage}
                  onChange={setUnitPage}
                  limit={unitLimit}
                  onLimitChange={(l) => {
                    setUnitLimit(l);
                    setUnitPage(1);
                  }}
                  itemLabel="unit"
                />
              </div>
            </>
          )}
        </SectionCard>
      )}

      {/* Valuasi & Pergerakan */}
      {tab === 'valuation' && (
        <div className="space-y-5">
          <SectionCard title="Perbandingan Cabang" icon={<Layers size={16} />} bodyClassName="p-0 md:p-0">
            {ovLoading || !overview ? <TableSkeleton rows={4} cols={5} /> : overview.branches.length === 0 ? (
              <EmptyState icon={Layers} title="Belum ada data cabang" description="Stok aktif belum tersedia." />
            ) : <DataTable columns={branchColumns} data={overview.branches} rowKey={(b) => b.id} />}
          </SectionCard>

          <SectionCard
            title="Pergerakan Stok"
            icon={<ArrowLeftRight size={16} />}
            bodyClassName="p-0 md:p-0"
            action={
              <div className="w-64">
                <SearchInput
                  size="sm"
                  value={moveSearch}
                  onChange={setMoveSearch}
                  placeholder="Cari pergerakan..."
                />
              </div>
            }
          >
            {overview && (
              <div className="px-4 py-3 grid grid-cols-3 gap-3 border-b border-divider">
                <div className="text-center"><p className="text-[11px] font-bold text-muted">Masuk</p><p className="text-lg font-extrabold text-accent-blue">{overview.movementSummary.masuk}</p></div>
                <div className="text-center"><p className="text-[11px] font-bold text-muted">Terjual</p><p className="text-lg font-extrabold text-accent-green">{overview.movementSummary.terjual}</p></div>
                <div className="text-center"><p className="text-[11px] font-bold text-muted">Transfer</p><p className="text-lg font-extrabold text-primary">{overview.movementSummary.transfer}</p></div>
              </div>
            )}
            {movesLoading ? (
              <TableSkeleton rows={5} cols={3} />
            ) : rawMoves.length === 0 ? (
              <EmptyState icon={ArrowLeftRight} title="Belum ada pergerakan" description="Tidak ada aktivitas pada rentang ini." />
            ) : filteredMoves.length === 0 ? (
              <EmptyState icon={ArrowLeftRight} title="Tidak ada pergerakan yang cocok" description={`Tidak ditemukan data dengan kata kunci "${moveSearch}".`} />
            ) : (
              <>
                <div className="divide-y divide-divider">
                  {filteredMoves.map((m: StockMovement) => {
                    const meta = MOVE_META[m.type];
                    const Icon = meta.Icon;
                    return (
                      <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.cls}`}><Icon size={15} /></span>
                        <div className="min-w-0 flex-1"><p className="text-[13px] font-bold text-ink truncate">{m.unitName} <span className="text-muted font-medium">· {m.platNomor}</span></p><p className="text-[11px] font-medium text-muted truncate">{m.label} · {m.detail}</p></div>
                        <span className="text-[11px] font-semibold text-muted shrink-0">{formatDate(m.date)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4">
                  <Pagination
                    meta={movesRes?.meta}
                    page={movePage}
                    onChange={setMovePage}
                    limit={moveLimit}
                    onLimitChange={(l) => {
                      setMoveLimit(l);
                      setMovePage(1);
                    }}
                    itemLabel="pergerakan"
                  />
                </div>
              </>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
};
