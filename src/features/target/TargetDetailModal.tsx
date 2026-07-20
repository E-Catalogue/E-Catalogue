import { useState } from 'react';
import type { AxiosError } from 'axios';
import { Target, Loader2, Plus, Trash2, PlayCircle, Lock, TrendingUp } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { SelectField, NumericField } from '@/shared/components/ui/Field';
import { classifyAxiosError } from '@/core/api/errorHandler';
import type { ApiErrorBody } from '@/core/api/types';
import { notifyApiError } from '@/core/api/notify';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { usePermissions } from '@/features/auth/usePermissions';
import { useTargetBranch, useTargetAchievement, useTargetLookupSales, useTargetMutations } from './target.hooks';
import {
  TARGET_STATUS_COLOR,
  TARGET_STATUS_LABEL,
  isTargetAchievementConsolidated,
  type BranchTarget,
  type SalesTarget,
  type SalesTargetAchievement,
  type SalesTargetReplaceRow,
  type TargetAchievement,
} from './target.types';

const idr = (n?: number | null) => (n == null ? '-' : formatCurrency(n));

interface DistributionRow extends SalesTargetReplaceRow {
  key: string;
}

const rowsFromSalesTargets = (rows?: SalesTarget[]): DistributionRow[] =>
  (rows ?? []).map((r) => ({ key: r.id, salesId: r.salesId, unitTarget: r.unitTarget, revenueTarget: r.revenueTarget }));

interface Props {
  open: boolean;
  onClose: () => void;
  targetId: string | null;
  branchKey: string;
  branchHeader: Record<string, string> | undefined;
}

/**
 * Query target dulu di komponen luar. Body/footer sesungguhnya (`TargetDetailLoaded`) baru
 * di-mount setelah `target` tersedia, di-key oleh `target.id` — state draft distribusi bisa
 * di-init langsung dari data (lazy initializer), tanpa perlu useEffect untuk menyinkronkannya.
 */
export const TargetDetailModal = ({ open, onClose, targetId, branchKey, branchHeader }: Props) => {
  const { data: targetRes } = useTargetBranch(targetId ?? undefined, branchKey, branchHeader);
  const target = targetRes;

  if (!open) return null;

  if (!target) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        icon={<Target size={20} />}
        title="Detail Target Cabang"
        size="xl"
        footer={<Button variant="secondary" onClick={onClose}>Tutup Jendela</Button>}
      >
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-muted" /></div>
      </Modal>
    );
  }

  return (
    <TargetDetailLoaded
      key={target.id}
      target={target}
      onClose={onClose}
      branchKey={branchKey}
      branchHeader={branchHeader}
    />
  );
};

interface LoadedProps {
  target: BranchTarget;
  onClose: () => void;
  branchKey: string;
  branchHeader: Record<string, string> | undefined;
}

const TargetDetailLoaded = ({ target, onClose, branchKey, branchHeader }: LoadedProps) => {
  const { can } = usePermissions();

  const isClosed = target.status === 'CLOSED';
  const { data: achRes } = useTargetAchievement(!isClosed ? target.period : undefined, branchKey, branchHeader);

  const achData = achRes?.data ?? null;
  let achievement: TargetAchievement | undefined;
  const salesAchievement = new Map<string, SalesTargetAchievement>();
  if (achData) {
    const single = isTargetAchievementConsolidated(achData) ? achData.breakdown.find((b) => b.branchId === target.branchId) : achData;
    achievement = single?.achievement;
    single?.salesTargets?.forEach((st) => { if (st.achievement) salesAchievement.set(st.salesId, st.achievement); });
  }

  // Lookup sales di-scope ke cabang target ITU SENDIRI, bukan branchHeader halaman (Owner yang sedang
  // "semua cabang" tetap bisa mengedit distribusi target milik satu cabang tertentu).
  const scopedBranchHeader = { 'X-Branch-Id': target.branchId };
  const { data: lookupRes } = useTargetLookupSales(scopedBranchHeader, target.status === 'DRAFT');
  const lookupSales = lookupRes?.data ?? [];

  const m = useTargetMutations(branchKey, branchHeader);

  const [rows, setRows] = useState<DistributionRow[]>(() => rowsFromSalesTargets(target.salesTargets));
  const [distError, setDistError] = useState<string | null>(null);
  const [dupSalesIds, setDupSalesIds] = useState<Set<string>>(new Set());
  const [confirmActivate, setConfirmActivate] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const sumUnit = rows.reduce((t, r) => t + (r.unitTarget || 0), 0);
  const sumRevenue = rows.reduce((t, r) => t + (r.revenueTarget || 0), 0);
  const diffUnit = target.unitTarget - sumUnit;
  const diffRevenue = target.revenueTarget - sumRevenue;
  const distributionMatches = diffUnit === 0 && diffRevenue === 0 && rows.length > 0;

  const addRow = () => setRows((prev) => [...prev, { key: `new-${Date.now()}-${prev.length}`, salesId: '', unitTarget: 0, revenueTarget: 0 }]);
  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));
  const updateRow = (key: string, patch: Partial<DistributionRow>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const handleDistError = (err: unknown) => {
    if (classifyAxiosError(err)) return;
    const ax = err as AxiosError<ApiErrorBody>;
    const code = ax.response?.data?.error?.code;
    if (code === 'DUPLICATE_SALES_TARGET') {
      const ids = rows.map((r) => r.salesId);
      const seen = new Set<string>();
      const dups = new Set<string>();
      ids.forEach((id) => { if (seen.has(id)) dups.add(id); seen.add(id); });
      setDupSalesIds(dups);
      setDistError('Ada sales yang dipilih lebih dari satu kali.');
      return;
    }
    if (code === 'CROSS_BRANCH_SALES_TARGET') {
      setDistError('Sales harus aktif dan berasal dari cabang yang sama dengan target ini. Muat ulang daftar sales.');
      return;
    }
    if (code === 'TARGET_DISTRIBUTION_MISMATCH') {
      setDistError('Total distribusi belum sama persis dengan target cabang.');
      return;
    }
    notifyApiError(err);
  };

  const saveDistribution = () => {
    setDistError(null);
    setDupSalesIds(new Set());
    const sales = rows.filter((r) => r.salesId).map(({ salesId, unitTarget, revenueTarget }) => ({ salesId, unitTarget, revenueTarget }));
    m.replaceSales.mutate({ id: target.id, body: { sales } }, { onError: handleDistError });
  };

  const doActivate = () => {
    m.activate.mutate(target.id, {
      onSuccess: () => setConfirmActivate(false),
      onError: (err) => { handleDistError(err); setConfirmActivate(false); },
    });
  };

  const doClose = () => {
    m.close.mutate(target.id, { onSuccess: () => setConfirmClose(false), onError: (err) => { notifyApiError(err); setConfirmClose(false); } });
  };

  const usedSalesIds = new Set(rows.map((r) => r.salesId).filter(Boolean));

  return (
    <>
      <Modal
        open
        onClose={onClose}
        icon={<Target size={20} />}
        title="Detail Target Cabang"
        subtitle={`${target.branch?.nama ?? target.branchId} · ${target.period}`}
        size="xl"
        footer={
          <div className="flex flex-wrap gap-2 justify-end w-full">
            {target.status === 'DRAFT' && can('TARGET_UPDATE') && (
              <Button variant="secondary" onClick={saveDistribution} disabled={m.replaceSales.isPending}>
                {m.replaceSales.isPending ? 'Menyimpan...' : 'Simpan Distribusi'}
              </Button>
            )}
            {target.status === 'DRAFT' && can('TARGET_ACTIVATE') && (
              <Button icon={<PlayCircle size={15} />} onClick={() => setConfirmActivate(true)} disabled={!distributionMatches}>
                Aktifkan
              </Button>
            )}
            {target.status === 'ACTIVE' && can('TARGET_CLOSE') && (
              <Button variant="danger" icon={<Lock size={15} />} onClick={() => setConfirmClose(true)}>
                Tutup
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>Tutup Jendela</Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold ${TARGET_STATUS_COLOR[target.status]}`}>
              {TARGET_STATUS_LABEL[target.status]}
            </span>
            {target.activatedAt && <span className="text-[11px] text-muted font-medium">Diaktifkan {new Date(target.activatedAt).toLocaleDateString('id-ID')}</span>}
            {target.closedAt && <span className="text-[11px] text-muted font-medium">Ditutup {new Date(target.closedAt).toLocaleDateString('id-ID')}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">Target Unit</p>
              <p className="text-xl font-extrabold text-ink">{formatNumber(target.unitTarget)} unit</p>
              <p className="text-[12px] font-semibold text-muted mt-1">
                Aktual: {formatNumber(isClosed ? (target.actualUnit ?? 0) : (achievement?.unitActual ?? 0))} unit
                {!isClosed && achievement && <span className="ml-1 text-primary">({achievement.unitPercent}%)</span>}
              </p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">Target Revenue</p>
              <p className="text-xl font-extrabold text-ink">{idr(target.revenueTarget)}</p>
              <p className="text-[12px] font-semibold text-muted mt-1">
                Aktual: {idr(isClosed ? (target.actualRevenue ?? 0) : (achievement?.revenueActual ?? 0))}
                {!isClosed && achievement && <span className="ml-1 text-primary">({achievement.revenuePercent}%)</span>}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-bold text-ink flex items-center gap-1.5"><TrendingUp size={14} /> Distribusi Sales</p>
              {target.status === 'DRAFT' && can('TARGET_UPDATE') && (
                <button
                  type="button"
                  onClick={addRow}
                  disabled={lookupSales.length === 0 || usedSalesIds.size >= lookupSales.length}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  <Plus size={13} /> Tambah Sales
                </button>
              )}
            </div>

            {target.status === 'DRAFT' && can('TARGET_UPDATE') ? (
              <div className="space-y-2">
                {rows.length === 0 && (
                  <p className="text-center py-6 text-[12px] text-muted border border-dashed border-border rounded-xl">
                    Belum ada distribusi sales. Klik &quot;Tambah Sales&quot;.
                  </p>
                )}
                {rows.map((row) => (
                  <div key={row.key} className={`flex flex-wrap items-end gap-2 p-3 rounded-xl border ${dupSalesIds.has(row.salesId) ? 'border-semantic-error bg-semantic-error/5' : 'border-border'}`}>
                    <SelectField
                      label="Sales"
                      wrapClass="flex-1 min-w-[160px]"
                      value={row.salesId}
                      onChange={(e) => updateRow(row.key, { salesId: e.target.value })}
                      options={[
                        { value: '', label: 'Pilih sales...' },
                        ...lookupSales
                          .filter((s) => s.id === row.salesId || !usedSalesIds.has(s.id))
                          .map((s) => ({ value: s.id, label: s.name })),
                      ]}
                    />
                    <NumericField label="Target Unit" wrapClass="w-32" value={row.unitTarget} onChange={(v) => updateRow(row.key, { unitTarget: v })} min={0} suffix="unit" />
                    <NumericField label="Target Revenue" wrapClass="w-44" value={row.revenueTarget} onChange={(v) => updateRow(row.key, { revenueTarget: v })} min={0} prefix="Rp" />
                    <button type="button" onClick={() => removeRow(row.key)} className="h-11 px-2.5 rounded-xl text-muted hover:text-semantic-error hover:bg-semantic-error/10 transition-colors shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                <div className={`rounded-xl p-3 text-[12px] font-semibold flex flex-wrap gap-x-4 gap-y-1 ${distributionMatches ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-amber/10 text-accent-amber'}`}>
                  <span>Total unit: {formatNumber(sumUnit)} / {formatNumber(target.unitTarget)} {diffUnit !== 0 && `(selisih ${diffUnit > 0 ? '-' : '+'}${formatNumber(Math.abs(diffUnit))})`}</span>
                  <span>Total revenue: {idr(sumRevenue)} / {idr(target.revenueTarget)} {diffRevenue !== 0 && `(selisih ${diffRevenue > 0 ? '-' : '+'}${idr(Math.abs(diffRevenue))})`}</span>
                </div>
                {distError && <p className="text-[11px] font-semibold text-semantic-error">{distError}</p>}
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden">
                {(target.salesTargets ?? []).length === 0 ? (
                  <p className="text-center py-6 text-[12px] text-muted">Belum ada distribusi sales.</p>
                ) : (
                  target.salesTargets!.map((st) => {
                    const ach = isClosed ? { unitActual: st.actualUnit ?? 0, revenueActual: st.actualRevenue ?? 0 } : salesAchievement.get(st.salesId);
                    return (
                      <div key={st.id} className="flex items-center gap-3 px-4 py-3 border-b border-divider last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-ink truncate">{st.sales?.name ?? st.salesId}</p>
                          <p className="text-[11px] text-muted font-medium">Target: {formatNumber(st.unitTarget)} unit · {idr(st.revenueTarget)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[12px] font-bold text-ink">{formatNumber(ach?.unitActual ?? 0)} unit</p>
                          <p className="text-[11px] text-muted font-medium">{idr(ach?.revenueActual ?? 0)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmActivate}
        onClose={() => setConfirmActivate(false)}
        onConfirm={doActivate}
        title="Aktifkan Target"
        message="Setelah diaktifkan, target dan distribusi sales tidak dapat diubah lagi. Pastikan distribusi sudah benar."
        confirmLabel="Aktifkan"
        tone="warning"
        loading={m.activate.isPending}
        closeOnConfirm={false}
      />
      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={doClose}
        title="Tutup Target"
        message="Menutup target akan menyimpan snapshot pencapaian akhir dan tindakan ini tidak dapat dibatalkan."
        confirmLabel="Tutup"
        tone="danger"
        loading={m.close.isPending}
        closeOnConfirm={false}
      />
    </>
  );
};
