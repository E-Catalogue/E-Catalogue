import { useState } from 'react';
import {
  Wrench, Plus, Search, Loader2, Eye, Pencil,
  ArrowRight, Car, Gauge, Calendar, CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { useUnits, useCreateRekondisi } from '@/features/units/unit.hooks';
import { useUnitModals } from '@/features/units/useUnitModals';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { RekondisiDetailModal } from './RekondisiDetailModal';
import type { Unit } from '@/features/units/unit.types';

const idr = (n?: number | null) => (n == null ? '—' : formatCurrency(n, { compact: true }));

const hppColor = (hpp?: number | null, beli?: number) => {
  if (!hpp || !beli) return 'text-ink font-bold';
  const pct = (hpp - beli) / beli;
  if (pct > 0.15) return 'text-semantic-error font-extrabold';
  if (pct > 0.08) return 'text-accent-amber font-bold';
  return 'text-ink font-bold';
};

/* ── Buat Rekondisi — 2-step confirm modal ── */
type CreateStep = 'confirm' | 'success';

const BuatRekondisiModal = ({
  unit,
  onClose,
  onSuccess,
}: {
  unit: Unit;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [step, setStep] = useState<CreateStep>('confirm');
  const createM = useCreateRekondisi();

  const handleCreate = () => {
    createM.mutate(unit.id, {
      onSuccess: () => setStep('success'),
    });
  };

  const handleKelola = () => {
    onClose();
    onSuccess();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={step === 'confirm' ? 'Buat Rekondisi Baru' : 'Rekondisi Berhasil Dibuat'}
      subtitle={step === 'confirm' ? 'Konfirmasi sebelum memulai proses rekondisi' : 'Lanjutkan untuk mengisi detail pekerjaan'}
      icon={step === 'confirm' ? <Wrench size={18} /> : <CheckCircle2 size={18} />}
      size="sm"
      footer={
        step === 'confirm' ? (
          <>
            <Button variant="secondary" onClick={onClose}>Batal</Button>
            <Button
              icon={<Plus size={15} />}
              onClick={handleCreate}
              disabled={createM.isPending}
            >
              {createM.isPending ? 'Membuat…' : 'Buat Rekondisi'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>Nanti Saja</Button>
            <Button icon={<ArrowRight size={15} />} onClick={handleKelola}>
              Kelola Rekondisi
            </Button>
          </>
        )
      }
    >
      {step === 'confirm' ? (
        <div className="space-y-4">
          {/* Unit info card */}
          <div className="rounded-2xl bg-surface-soft border border-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                <Car size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-extrabold text-ink text-[14px]">{unit.platNomor}</p>
                <p className="text-[12px] text-muted font-medium">
                  {unit.merek?.name ?? '—'} {unit.tipe?.name ?? ''} · {unit.tahun}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-divider">
              <div className="flex items-center gap-1.5 text-[12px] text-muted font-medium">
                <Gauge size={13} /> {formatNumber(unit.kilometer)} KM
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-muted font-medium">
                <Calendar size={13} /> Beli: {idr(unit.hargaBeli)}
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-2.5">
            <p className="text-[13px] font-semibold text-ink-soft leading-relaxed">
              Rekondisi baru akan dibuat untuk unit ini dengan status{' '}
              <span className="font-bold text-ink">Pending</span>.
            </p>
            <div className="space-y-2">
              {[
                'Rekondisi dibuat dengan status Pending',
                'Tambahkan vendor & item pekerjaan',
                'Mulai pengerjaan → selesaikan & upload invoice',
                'HPP unit diperbarui otomatis',
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 text-[12px] text-muted font-medium">
                  <span className="w-5 h-5 rounded-full bg-primary-light text-primary font-extrabold text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-accent-green/10 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-accent-green" />
          </div>
          <div>
            <p className="font-extrabold text-ink text-[15px]">Rekondisi berhasil dibuat!</p>
            <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">
              Anda dapat langsung menambahkan vendor, item pekerjaan, dan memulai pengerjaan.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

/* ── Main Page ── */
export const RekondisiPage = () => {
  const [query, setQuery]             = useState('');
  const [rekondisiUnit, setRekondisiUnit] = useState<Unit | null>(null);
  const [createTarget, setCreateTarget]   = useState<Unit | null>(null);
  const debounced = useDebouncedValue(query, 400);

  const { data, isLoading, isError } = useUnits({
    page: 1, limit: 100,
    statusUnit: 'INVENTORY',
    search: debounced || undefined,
  });

  const units: Unit[] = data?.data ?? [];
  const total         = data?.meta?.total ?? 0;
  const m             = useUnitModals();

  const columns: Column<Unit>[] = [
    {
      header: 'Unit',
      cell: (u) => (
        <div>
          <p className="font-bold text-ink text-[13px]">{u.platNomor}</p>
          <p className="text-[11px] text-muted font-medium mt-0.5">
            {u.merek?.name ?? '—'} {u.tipe?.name ?? ''}
          </p>
        </div>
      ),
    },
    {
      header: 'Tahun / KM',
      align: 'right',
      cell: (u) => (
        <div className="text-right">
          <p className="font-bold text-ink text-[13px]">{u.tahun}</p>
          <p className="text-[11px] text-muted font-medium">{formatNumber(u.kilometer)} KM</p>
        </div>
      ),
    },
    {
      header: 'Transmisi',
      align: 'center',
      cell: (u) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${
          u.transmisi === 'AUTOMATIC' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-muted/10 text-muted'
        }`}>
          {u.transmisi === 'AUTOMATIC' ? 'AT' : 'MT'}
        </span>
      ),
    },
    {
      header: 'Harga Beli',
      align: 'right',
      cell: (u) => <span className="font-bold text-ink text-[13px]">{idr(u.hargaBeli)}</span>,
    },
    {
      header: 'HPP (Akumulasi)',
      align: 'right',
      cell: (u) => {
        const hpp = u.hpp;
        const delta = hpp && u.hargaBeli ? hpp - u.hargaBeli : null;
        return hpp ? (
          <div className="text-right">
            <span className={`text-[13px] ${hppColor(hpp, u.hargaBeli)}`}>{idr(hpp)}</span>
            {delta !== null && (
              <p className="text-[10px] text-muted font-medium mt-0.5">+{idr(delta)} rekondisi</p>
            )}
          </div>
        ) : (
          <span className="text-[12px] text-muted/50 font-medium italic">Belum ada</span>
        );
      },
    },
    {
      header: '',
      align: 'right',
      cell: (u) => (
        <ActionMenu items={[
          {
            icon: <Wrench size={13} />,
            label: 'Kelola Rekondisi',
            onClick: () => setRekondisiUnit(u),
            variant: 'primary',
          },
          {
            icon: <Plus size={13} />,
            label: 'Buat Rekondisi Baru',
            onClick: () => setCreateTarget(u),
            dividerAfter: true,
          },
          {
            icon: <Eye size={13} />,
            label: 'Lihat Detail Unit',
            onClick: () => m.openDetail(u),
          },
          {
            icon: <Pencil size={13} />,
            label: 'Edit Unit',
            onClick: () => m.openEdit(u),
          },
        ]} />
      ),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Rekondisi"
        description={`${total} unit dalam tahap inventori`}
      />

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari plat / merek / tipe…"
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      {/* Table */}
      <SectionCard
        title={`Daftar Unit (${units.length})`}
        icon={<Wrench size={16} />}
        bodyClassName="p-0 md:p-0"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
        ) : units.length === 0 ? (
          <div className="text-center py-16">
            <Wrench size={32} className="text-muted mx-auto mb-3" />
            <p className="font-bold text-ink text-[14px]">
              {query ? 'Tidak ada unit yang cocok.' : 'Belum ada unit dalam rekondisi.'}
            </p>
            <p className="text-muted text-[12px] font-medium mt-1">
              Unit berstatus Inventory akan muncul di sini.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={units} rowKey={(u) => u.id} />
        )}
      </SectionCard>

      {m.modals}

      {/* Buat rekondisi — confirm modal */}
      {createTarget && (
        <BuatRekondisiModal
          unit={createTarget}
          onClose={() => setCreateTarget(null)}
          onSuccess={() => setRekondisiUnit(createTarget)}
        />
      )}

      {/* Kelola rekondisi modal */}
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
