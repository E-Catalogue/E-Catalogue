import { useState, type FormEvent } from 'react';
import { 
  Target, CalendarDays, Award, 
  Plus, Edit3
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { Can } from '@/features/auth/permissions';
import { formatCurrency } from '@/core/utils/format';
import { CurrencyField } from '@/features/finance/components';

export interface MonthlyTarget {
  id: string;
  monthIndex: number;
  monthName: string;
  targetUnit: number;
  realisasiUnit: number;
  targetOmzet: number;
  realisasiOmzet: number;
  status: 'SURPLUS' | 'TERCAPAI' | 'PERHATIAN' | 'BERJALAN' | 'BELUM';
  salesAllocations: { name: string; target: number; realisasi: number }[];
}

const INITIAL_TARGETS: MonthlyTarget[] = [
  { id: 'm1', monthIndex: 1, monthName: 'Januari', targetUnit: 25, realisasiUnit: 27, targetOmzet: 5000000000, realisasiOmzet: 5400000000, status: 'SURPLUS', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 10 }, { name: 'Budi', target: 8, realisasi: 9 }, { name: 'Citra', target: 8, realisasi: 8 }] },
  { id: 'm2', monthIndex: 2, monthName: 'Februari', targetUnit: 25, realisasiUnit: 23, targetOmzet: 5000000000, realisasiOmzet: 4600000000, status: 'PERHATIAN', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 8 }, { name: 'Budi', target: 8, realisasi: 8 }, { name: 'Citra', target: 8, realisasi: 7 }] },
  { id: 'm3', monthIndex: 3, monthName: 'Maret', targetUnit: 25, realisasiUnit: 26, targetOmzet: 5000000000, realisasiOmzet: 5200000000, status: 'SURPLUS', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 10 }, { name: 'Budi', target: 8, realisasi: 8 }, { name: 'Citra', target: 8, realisasi: 8 }] },
  { id: 'm4', monthIndex: 4, monthName: 'April', targetUnit: 25, realisasiUnit: 25, targetOmzet: 5000000000, realisasiOmzet: 5000000000, status: 'TERCAPAI', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 9 }, { name: 'Budi', target: 8, realisasi: 8 }, { name: 'Citra', target: 8, realisasi: 8 }] },
  { id: 'm5', monthIndex: 5, monthName: 'Mei', targetUnit: 25, realisasiUnit: 28, targetOmzet: 5000000000, realisasiOmzet: 5600000000, status: 'SURPLUS', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 11 }, { name: 'Budi', target: 8, realisasi: 9 }, { name: 'Citra', target: 8, realisasi: 8 }] },
  { id: 'm6', monthIndex: 6, monthName: 'Juni', targetUnit: 25, realisasiUnit: 24, targetOmzet: 5000000000, realisasiOmzet: 4800000000, status: 'PERHATIAN', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 9 }, { name: 'Budi', target: 8, realisasi: 8 }, { name: 'Citra', target: 8, realisasi: 7 }] },
  { id: 'm7', monthIndex: 7, monthName: 'Juli (Berjalan)', targetUnit: 25, realisasiUnit: 18, targetOmzet: 5000000000, realisasiOmzet: 3240000000, status: 'BERJALAN', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 8 }, { name: 'Budi', target: 8, realisasi: 6 }, { name: 'Citra', target: 8, realisasi: 4 }] },
  { id: 'm8', monthIndex: 8, monthName: 'Agustus', targetUnit: 25, realisasiUnit: 0, targetOmzet: 5000000000, realisasiOmzet: 0, status: 'BELUM', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 0 }, { name: 'Budi', target: 8, realisasi: 0 }, { name: 'Citra', target: 8, realisasi: 0 }] },
  { id: 'm9', monthIndex: 9, monthName: 'September', targetUnit: 25, realisasiUnit: 0, targetOmzet: 5000000000, realisasiOmzet: 0, status: 'BELUM', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 0 }, { name: 'Budi', target: 8, realisasi: 0 }, { name: 'Citra', target: 8, realisasi: 0 }] },
  { id: 'm10', monthIndex: 10, monthName: 'Oktober', targetUnit: 25, realisasiUnit: 0, targetOmzet: 5000000000, realisasiOmzet: 0, status: 'BELUM', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 0 }, { name: 'Budi', target: 8, realisasi: 0 }, { name: 'Citra', target: 8, realisasi: 0 }] },
  { id: 'm11', monthIndex: 11, monthName: 'November', targetUnit: 25, realisasiUnit: 0, targetOmzet: 5000000000, realisasiOmzet: 0, status: 'BELUM', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 0 }, { name: 'Budi', target: 8, realisasi: 0 }, { name: 'Citra', target: 8, realisasi: 0 }] },
  { id: 'm12', monthIndex: 12, monthName: 'Desember', targetUnit: 25, realisasiUnit: 0, targetOmzet: 5000000000, realisasiOmzet: 0, status: 'BELUM', salesAllocations: [{ name: 'Andi', target: 9, realisasi: 0 }, { name: 'Budi', target: 8, realisasi: 0 }, { name: 'Citra', target: 8, realisasi: 0 }] },
];

export const TargetPenjualanPage = () => {
  const [year, setYear] = useState('2026');
  const [targets, setTargets] = useState<MonthlyTarget[]>(INITIAL_TARGETS);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editModal, setEditModal] = useState<MonthlyTarget | null>(null);
  const [formUnit, setFormUnit] = useState('');
  const [formOmzet, setFormOmzet] = useState('');

  const openEdit = (m: MonthlyTarget) => {
    setEditModal(m);
    setFormUnit(String(m.targetUnit));
    setFormOmzet(String(m.targetOmzet));
  };

  const handleSaveTarget = (e: FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    const unitVal = Number(formUnit) || 0;
    const omzetVal = Number(formOmzet) || 0;
    setTargets((prev) =>
      prev.map((t) => (t.id === editModal.id ? { ...t, targetUnit: unitVal, targetOmzet: omzetVal } : t)),
    );
    setEditModal(null);
  };

  const columns: Column<MonthlyTarget>[] = [
    { header: 'Bulan', cell: (m) => <span className="font-extrabold text-ink text-sm">{m.monthName}</span> },
    { header: 'Target Unit', align: 'center', cell: (m) => <span className="font-extrabold text-primary">{m.targetUnit} Unit</span> },
    { header: 'Realisasi Unit', align: 'center', cell: (m) => (
      <span className={`font-extrabold ${m.realisasiUnit >= m.targetUnit ? 'text-accent-green' : m.status === 'BELUM' ? 'text-muted' : 'text-accent-amber'}`}>
        {m.realisasiUnit} Unit
      </span>
    )},
    { header: 'Pencapaian Unit', align: 'center', cell: (m) => {
      const pct = m.targetUnit ? Math.round((m.realisasiUnit / m.targetUnit) * 100) : 0;
      return (
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
          pct >= 100 ? 'bg-accent-green/15 text-accent-green' : pct >= 70 ? 'bg-accent-blue/15 text-accent-blue' : m.status === 'BELUM' ? 'bg-surface-soft text-muted' : 'bg-accent-amber/15 text-accent-amber'
        }`}>
          {pct}%
        </span>
      );
    }},
    { header: 'Target Omzet', align: 'right', cell: (m) => <span className="font-extrabold text-ink">{formatCurrency(m.targetOmzet, { compact: true })}</span> },
    { header: 'Realisasi Omzet', align: 'right', cell: (m) => (
      <span className={`font-extrabold ${m.realisasiOmzet >= m.targetOmzet ? 'text-accent-green' : m.status === 'BELUM' ? 'text-muted' : 'text-accent-amber'}`}>
        {formatCurrency(m.realisasiOmzet, { compact: true })}
      </span>
    )},
    { header: 'Pencapaian Omzet', align: 'center', cell: (m) => {
      const pct = m.targetOmzet ? Math.round((m.realisasiOmzet / m.targetOmzet) * 100) : 0;
      return (
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
          pct >= 100 ? 'bg-accent-green/15 text-accent-green' : pct >= 70 ? 'bg-accent-blue/15 text-accent-blue' : m.status === 'BELUM' ? 'bg-surface-soft text-muted' : 'bg-accent-amber/15 text-accent-amber'
        }`}>
          {pct}%
        </span>
      );
    }},
    { header: 'Status Bulan', align: 'center', cell: (m) => {
      const map = {
        SURPLUS: { text: 'SURPLUS', color: 'bg-accent-green/15 text-accent-green border-accent-green/30' },
        TERCAPAI: { text: 'TERCAPAI', color: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30' },
        PERHATIAN: { text: 'PERHATIAN', color: 'bg-accent-amber/15 text-accent-amber border-accent-amber/30' },
        BERJALAN: { text: 'BERJALAN', color: 'bg-primary/15 text-primary border-primary/30' },
        BELUM: { text: 'BELUM MULAI', color: 'bg-surface-soft text-muted border-divider' },
      }[m.status];
      return <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${map?.color || ''}`}>{map?.text || m.status}</span>;
    }},
    { header: 'Aksi', align: 'right', cell: (m) => (
      <Button variant="secondary" size="sm" icon={<Edit3 size={13} />} onClick={() => openEdit(m)}>Edit Target</Button>
    )},
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-float-up pb-12">
      {/* Header & Year Selector Bar */}
      <PageHeader
        title="Manajemen Target Penjualan & Omzet"
        description="Pengelompokan dan pengaturan target volume unit, target omzet, serta evaluasi performa per bulan untuk seluruh tim sales"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-border shadow-sm">
              <CalendarDays size={16} className="text-primary" />
              <span className="text-[12px] font-bold text-muted">Tahun Buku:</span>
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="bg-transparent text-sm font-extrabold text-ink focus:outline-none cursor-pointer pr-1"
              >
                <option value="2026">2026 (Aktif)</option>
                <option value="2025">2025 (Periode Lalu)</option>
                <option value="2027">2027 (Proyeksi)</option>
              </select>
            </div>
            <Can any={['SALES_TARGET_UPDATE', 'SALES_TARGET_CREATE', 'PENJUALAN_UPDATE', 'SALES_TARGET']}>
              <Button icon={<Plus size={16} />} onClick={() => openEdit(targets[6])} className="bg-primary hover:bg-primary/90 text-white font-extrabold shadow-sm">
                + Atur Target Bulan Berjalan
              </Button>
            </Can>
          </div>
        }
      />

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-sm">
        <div className="flex items-center gap-2.5">
          <Award size={20} className="text-accent-amber" />
          <div>
            <span className="text-sm font-extrabold text-ink">Evaluasi Target Showroom {year}: </span>
            <span className="text-sm font-bold text-accent-green">Semester 1 (Jan-Jun) Surplus +3 Unit • Bulan Juli Berjalan 72%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode('grid')} 
            className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold border transition-all ${viewMode === 'grid' ? 'bg-primary text-white border-primary' : 'bg-surface text-muted border-border hover:text-ink'}`}
          >
            Tampilan Kartu Bulanan
          </button>
          <button 
            onClick={() => setViewMode('table')} 
            className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold border transition-all ${viewMode === 'table' ? 'bg-primary text-white border-primary' : 'bg-surface text-muted border-border hover:text-ink'}`}
          >
            Tampilan Tabel Matriks
          </button>
        </div>
      </div>

      {/* Main Monthly Targets Section: Grid Cards or Matrix Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
            <Target size={18} className="text-primary" /> Daftar Target & Realisasi Per Bulan (12 Bulan {year})
          </h3>
          <span className="text-[12px] font-bold text-muted">Klik "Edit Target" untuk menyesuaikan angka target bulan tertentu</span>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {targets.map((m) => {
              const pct = m.targetUnit ? Math.round((m.realisasiUnit / m.targetUnit) * 100) : 0;
              const isSurplus = m.realisasiUnit >= m.targetUnit;
              const isNotStarted = m.status === 'BELUM';

              return (
                <div key={m.id} className="bg-surface rounded-2xl p-5 border border-border shadow-sm hover:shadow-card transition-all flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-divider">
                      <span className="text-base font-extrabold text-ink">{m.monthName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        isSurplus && !isNotStarted ? 'bg-accent-green/15 text-accent-green' : m.status === 'BERJALAN' ? 'bg-primary/15 text-primary' : isNotStarted ? 'bg-surface-soft text-muted' : 'bg-accent-amber/15 text-accent-amber'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-b border-divider/60">
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase block">Target Unit</span>
                        <span className="text-lg font-extrabold text-primary">{m.targetUnit} Unit</span>
                        <span className="text-[11px] font-bold text-muted block mt-0.5">{formatCurrency(m.targetOmzet, { compact: true })}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase block">Realisasi</span>
                        <span className={`text-lg font-extrabold ${isNotStarted ? 'text-muted' : isSurplus ? 'text-accent-green' : 'text-accent-amber'}`}>
                          {isNotStarted ? '-' : `${m.realisasiUnit} Unit`}
                        </span>
                        <span className={`text-[11px] font-extrabold block mt-0.5 ${isNotStarted ? 'text-muted' : isSurplus ? 'text-accent-green' : 'text-ink'}`}>
                          {isNotStarted ? '-' : formatCurrency(m.realisasiOmzet, { compact: true })}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-muted">Pencapaian Volume</span>
                        <span className={isNotStarted ? 'text-muted' : isSurplus ? 'text-accent-green font-extrabold' : 'text-ink'}>
                          {isNotStarted ? 'Belum Berjalan' : `${pct}% Tercapai`}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-surface-soft overflow-hidden border border-divider">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${isNotStarted ? 'bg-transparent' : isSurplus ? 'bg-accent-green' : 'bg-accent-amber'}`} 
                          style={{ width: `${Math.min(pct, 100)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Sales Allocation breakdown */}
                    <div className="mt-3 pt-2 border-t border-divider/40 space-y-1 text-[11px]">
                      <span className="text-[10px] font-bold text-muted uppercase block">Breakdown Tim Sales:</span>
                      {m.salesAllocations.map((sa, sidx) => (
                        <div key={sidx} className="flex items-center justify-between text-muted">
                          <span className="font-semibold">{sa.name}</span>
                          <span className="font-bold text-ink">{isNotStarted ? `Target: ${sa.target} unit` : `${sa.realisasi} / ${sa.target} unit`}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="secondary" size="sm" icon={<Edit3 size={13} />} onClick={() => openEdit(m)} className="w-full font-bold">
                    Edit Target Bulan Ini
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <SectionCard className="overflow-hidden shadow-card" bodyClassName="p-0 md:p-0">
            <DataTable columns={columns} data={targets} rowKey={(m) => m.id} />
          </SectionCard>
        )}
      </div>

      {/* Edit Monthly Target Modal */}
      {editModal && (
        <Modal
          open
          onClose={() => setEditModal(null)}
          title={`Edit Target Penjualan — ${editModal.monthName} ${year}`}
          icon={<Target size={20} className="text-primary" />}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditModal(null)}>Batal</Button>
              <Button type="submit" form="edit-target-form" className="bg-primary text-white font-extrabold">
                Simpan Target Bulanan
              </Button>
            </>
          }
        >
          <form id="edit-target-form" onSubmit={handleSaveTarget} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-extrabold text-base shrink-0">
                {editModal.monthIndex}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-ink">Pengaturan Target Periode {editModal.monthName} {year}</h4>
                <p className="text-[11px] font-semibold text-muted">Perubahan target akan secara otomatis mengupdate indikator progres dan insentif tim sales.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <TextField
                label="Target Volume Unit Mobil"
                required
                type="number"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                placeholder="Contoh: 25"
              />
              <CurrencyField
                label="Target Omzet Penjualan (Rp)"
                required
                value={formOmzet}
                onChange={(e) => setFormOmzet(e.target.value)}
              />
            </div>

            <div className="space-y-2 pt-3 border-t border-divider">
              <span className="text-[12px] font-extrabold text-ink block">Alokasi Otomatis Per Personil Sales (3 Personil)</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                {['Andi Firmansyah', 'Budi Santoso', 'Citra Dewi'].map((sales, sidx) => {
                  const unitVal = Number(formUnit) || 0;
                  const allocUnit = sidx === 0 ? Math.ceil(unitVal / 3) : Math.floor(unitVal / 3);
                  return (
                    <div key={sidx} className="p-2.5 rounded-xl bg-surface-soft border border-border">
                      <span className="text-[11px] font-bold text-ink block truncate">{sales}</span>
                      <span className="text-base font-extrabold text-primary mt-1 block">{allocUnit} Unit</span>
                      <span className="text-[10px] font-semibold text-muted">Target Individu</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
