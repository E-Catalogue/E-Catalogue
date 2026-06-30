import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Wrench, Pencil, Wallet, Plus, Search, Loader2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { useUnits, useCreateRekondisi } from '@/features/units/unit.hooks';
import { useUnitModals } from '@/features/units/useUnitModals';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { RekondisiDetailModal } from './RekondisiDetailModal';
import type { Unit } from '@/features/units/unit.types';

const idr = (n?: number | null) =>
  n == null ? '—' : formatCurrency(n, { compact: true });

const HPP_COLOR = (hpp?: number | null, beli?: number) => {
  if (!hpp || !beli) return 'text-ink';
  const pct = (hpp - beli) / beli;
  if (pct > 0.15) return 'text-semantic-error font-extrabold';
  if (pct > 0.08) return 'text-accent-amber font-bold';
  return 'text-ink font-bold';
};

/* ── Row-level create button — needs own hook instance ── */
const CreateBtn = ({ unitId, onDone }: { unitId: string; onDone: () => void }) => {
  const m = useCreateRekondisi();
  return (
    <button
      onClick={() => m.mutate(unitId, { onSuccess: onDone })}
      disabled={m.isPending}
      title="Buat Rekondisi Baru"
      className="p-2 rounded-lg text-muted hover:text-accent-green hover:bg-accent-green/10 transition-colors disabled:opacity-40"
    >
      {m.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} strokeWidth={2.3} />}
    </button>
  );
};
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { CashAccountSelect } from '@/features/finance/components';
import { apiClient } from '@/core/api/client';
import { notifyApiError } from '@/core/api/notify';
import type { Unit } from '@/data/types';

const PayRekondisiModal = ({ unit, onClose }: { unit: Unit; onClose: () => void }) => {
  const [form, setForm] = useState({ cashAccountId: '', paidDate: new Date().toISOString().slice(0, 10) });
  const pay = useMutation({
    mutationFn: () => apiClient.post(`/rekondisis/${unit.id}/pay`, { cashAccountId: form.cashAccountId, paidDate: new Date(form.paidDate).toISOString() }),
    onSuccess: onClose,
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    pay.mutate(undefined, { onError: (e) => notifyApiError(e) });
  };
  return (
    <Modal open onClose={onClose} title="Bayar Rekondisi" icon={<Wallet size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="pay-rekondisi-form" disabled={pay.isPending}>Bayar</Button></>}>
      <form id="pay-rekondisi-form" onSubmit={submit} className="space-y-4">
        <div className="rounded-xl bg-surface-soft border border-border p-4"><p className="text-[11px] font-bold uppercase text-muted">{unit.brand} {unit.model}</p><p className="text-sm font-semibold text-ink-soft mt-1">Pembayaran rekondisi akan dicatat sebagai kas keluar.</p></div>
        <CashAccountSelect required value={form.cashAccountId} onChange={(v) => setForm((f) => ({ ...f, cashAccountId: v }))} />
        <TextField label="Tanggal Bayar" required type="date" value={form.paidDate} onChange={(e) => setForm((f) => ({ ...f, paidDate: e.target.value }))} />
      </form>
    </Modal>
  );
};

export const RekondisiPage = () => {
  const [query, setQuery]             = useState('');
  const [rekondisiUnit, setRekondisiUnit] = useState<Unit | null>(null);
  const debounced = useDebouncedValue(query, 400);

  const { data, isLoading, isError } = useUnits({
    page: 1, limit: 100,
    statusUnit: 'INVENTORY',
    search: debounced || undefined,
  });

  const units: Unit[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const m = useUnitModals();
  const [payUnit, setPayUnit] = useState<Unit | null>(null);

  const openRekondisi = (u: Unit) => setRekondisiUnit(u);

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up">
      <PageHeader
        title="Rekondisi"
        description={`${total} unit dalam tahap inventori & rekondisi`}
        action={
          <Button icon={<Wrench size={16} strokeWidth={2.5} />} onClick={m.openCreate}>
            Tambah Unit
          </Button>
        }
      />

      {/* Info banner */}
      <div className="flex items-start gap-3 p-3.5 mb-5 rounded-xl bg-accent-amber/8 border border-accent-amber/25">
        <AlertCircle size={16} className="text-accent-amber shrink-0 mt-0.5" />
        <p className="text-[12px] font-semibold text-ink-soft leading-relaxed">
          Halaman ini menampilkan unit berstatus <strong>Inventory</strong>. Gunakan tombol <strong>Kelola Rekondisi</strong> untuk mencatat biaya perbaikan per unit, lalu selesaikan agar HPP terhitung otomatis sebelum unit dipindah ke Ready Stock.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari plat / merek / tipe…"
          className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface border border-border text-[13px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted">
            <Loader2 size={20} className="animate-spin" /> <span className="text-[13px] font-semibold">Memuat data…</span>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-semantic-error font-semibold text-[13px]">Gagal memuat data.</div>
        ) : units.length === 0 ? (
          <div className="py-20 text-center">
            <Wrench size={32} className="text-muted mx-auto mb-3" />
            <p className="text-[14px] font-bold text-ink">{query ? 'Tidak ada unit yang cocok.' : 'Tidak ada unit dalam rekondisi.'}</p>
            <p className="text-[12px] text-muted font-medium mt-1">Unit berstatus Inventory akan muncul di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <table className="w-full border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-surface-soft border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted text-left w-10">#</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted text-left">Unit</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted text-right">Tahun / KM</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted text-center">Transmisi</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted text-right">Harga Beli</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted text-right">
                    HPP
                    <span className="ml-1 text-[9px] normal-case tracking-normal font-normal text-muted/70">(akum.)</span>
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u, i) => {
                  const merek = u.merek?.name ?? '—';
                  const tipe  = u.tipe?.name ?? '';
                  const hpp   = u.hpp;
                  const margin = hpp && u.hargaBeli ? hpp - u.hargaBeli : null;

                  return (
                    <tr key={u.id} className="border-b border-divider last:border-0 hover:bg-surface-soft/60 transition-colors group">
                      <td className="px-4 py-3.5 text-[12px] text-muted font-semibold">{i + 1}</td>

                      {/* Unit */}
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-extrabold text-ink">{u.platNomor}</p>
                        <p className="text-[11px] text-muted font-semibold mt-0.5">{merek} {tipe}</p>
                      </td>

                      {/* Tahun / KM */}
                      <td className="px-4 py-3.5 text-right">
                        <p className="text-[13px] font-bold text-ink">{u.tahun}</p>
                        <p className="text-[11px] text-muted font-semibold">{formatNumber(u.kilometer)} KM</p>
                      </td>

                      {/* Transmisi */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          u.transmisi === 'AUTOMATIC' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-muted/10 text-muted'
                        }`}>
                          {u.transmisi === 'AUTOMATIC' ? 'AT' : 'MT'}
                        </span>
                      </td>

                      {/* Harga Beli */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[13px] font-bold text-ink">{idr(u.hargaBeli)}</span>
                      </td>

                      {/* HPP */}
                      <td className="px-4 py-3.5 text-right">
                        {hpp ? (
                          <div>
                            <span className={`text-[13px] ${HPP_COLOR(hpp, u.hargaBeli)}`}>{idr(hpp)}</span>
                            {margin !== null && (
                              <p className="text-[10px] font-semibold text-muted mt-0.5">
                                +{idr(margin)} rekondisi
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[12px] text-muted/60 font-medium">Belum ada</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          {/* Kelola Rekondisi — primary action */}
                          <button
                            onClick={() => openRekondisi(u)}
                            title="Kelola Rekondisi"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-amber/10 text-accent-amber hover:bg-accent-amber/20 font-bold text-[11px] transition-colors"
                          >
                            <Wrench size={13} strokeWidth={2.3} /> Kelola
                          </button>

                          {/* Buat rekondisi baru */}
                          <CreateBtn unitId={u.id} onDone={() => openRekondisi(u)} />

                          {/* Edit unit */}
                          <button
                            onClick={() => m.openEdit(u)}
                            title="Edit Unit"
                            className="p-2 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                          >
                            <Pencil size={14} strokeWidth={2.2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table footer: summary */}
            <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-surface-soft/40">
              <p className="text-[12px] text-muted font-semibold">
                {units.length} unit · Total HPP:{' '}
                <span className="text-ink font-bold">
                  {idr(units.reduce((s, u) => s + (u.hpp ?? u.hargaBeli ?? 0), 0))}
                </span>
              </p>
                <div className="mt-3">
                  {u.paidAt ? (
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold bg-accent-green/10 text-accent-green">Sudah Dibayar</span>
                  ) : (u.rekondisiProgress ?? 0) >= 100 ? (
                    <Button icon={<Wallet size={14} />} onClick={() => setPayUnit(u)}>Bayar Rekondisi</Button>
                  ) : null}
                </div>
              <p className="text-[11px] text-muted font-medium">Klik <strong>Kelola</strong> untuk detail biaya rekondisi</p>
            </div>
          </div>
        )}
      </div>

      {m.modals}
      {payUnit && <PayRekondisiModal unit={payUnit} onClose={() => setPayUnit(null)} />}

      <RekondisiDetailModal
        open={!!rekondisiUnit}
        onClose={() => setRekondisiUnit(null)}
        unitId={rekondisiUnit?.id ?? null}
        unitLabel={
          rekondisiUnit
            ? `${rekondisiUnit.platNomor} · ${rekondisiUnit.merek?.name ?? ''} ${rekondisiUnit.tipe?.name ?? ''}`
            : undefined
        }
      />
    </div>
  );
};
