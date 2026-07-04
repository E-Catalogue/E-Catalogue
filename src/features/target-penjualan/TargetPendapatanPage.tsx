import { useState, type FormEvent } from 'react';
import { 
  DollarSign, CalendarDays, Award, 
  Plus, Edit3
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { Can } from '@/features/auth/permissions';
import { formatCurrency } from '@/core/utils/format';

export interface MonthlyRevenueTarget {
  id: string;
  monthIndex: number;
  monthName: string;
  targetOmzet: number;
  realisasiOmzet: number;
  targetLaba: number;
  realisasiLaba: number;
  targetLeasingFee: number;
  realisasiLeasingFee: number;
  status: 'SURPLUS' | 'TERCAPAI' | 'PERHATIAN' | 'BERJALAN' | 'BELUM';
  streams: {
    unitSales: number;
    leasingFee: number;
    otherRevenue: number;
  };
}

const INITIAL_REVENUE_TARGETS: MonthlyRevenueTarget[] = [
  {
    id: 'rev-1',
    monthIndex: 1,
    monthName: 'Januari',
    targetOmzet: 5000000000,
    realisasiOmzet: 5250000000,
    targetLaba: 550000000,
    realisasiLaba: 590000000,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 65000000,
    status: 'SURPLUS',
    streams: { unitSales: 5150000000, leasingFee: 65000000, otherRevenue: 35000000 },
  },
  {
    id: 'rev-2',
    monthIndex: 2,
    monthName: 'Februari',
    targetOmzet: 5000000000,
    realisasiOmzet: 4600000000,
    targetLaba: 550000000,
    realisasiLaba: 485000000,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 42000000,
    status: 'PERHATIAN',
    streams: { unitSales: 4530000000, leasingFee: 42000000, otherRevenue: 28000000 },
  },
  {
    id: 'rev-3',
    monthIndex: 3,
    monthName: 'Maret',
    targetOmzet: 5000000000,
    realisasiOmzet: 5100000000,
    targetLaba: 550000000,
    realisasiLaba: 565000000,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 55000000,
    status: 'TERCAPAI',
    streams: { unitSales: 5015000000, leasingFee: 55000000, otherRevenue: 30000000 },
  },
  {
    id: 'rev-4',
    monthIndex: 4,
    monthName: 'April',
    targetOmzet: 5000000000,
    realisasiOmzet: 5050000000,
    targetLaba: 550000000,
    realisasiLaba: 560000000,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 52000000,
    status: 'TERCAPAI',
    streams: { unitSales: 4968000000, leasingFee: 52000000, otherRevenue: 30000000 },
  },
  {
    id: 'rev-5',
    monthIndex: 5,
    monthName: 'Mei',
    targetOmzet: 5000000000,
    realisasiOmzet: 5800000000,
    targetLaba: 550000000,
    realisasiLaba: 660000000,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 78000000,
    status: 'SURPLUS',
    streams: { unitSales: 5685000000, leasingFee: 78000000, otherRevenue: 37000000 },
  },
  {
    id: 'rev-6',
    monthIndex: 6,
    monthName: 'Juni',
    targetOmzet: 5000000000,
    realisasiOmzet: 4800000000,
    targetLaba: 550000000,
    realisasiLaba: 515000000,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 45000000,
    status: 'PERHATIAN',
    streams: { unitSales: 4725000000, leasingFee: 45000000, otherRevenue: 30000000 },
  },
  {
    id: 'rev-7',
    monthIndex: 7,
    monthName: 'Juli',
    targetOmzet: 5000000000,
    realisasiOmzet: 3600000000,
    targetLaba: 550000000,
    realisasiLaba: 395000000,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 38000000,
    status: 'BERJALAN',
    streams: { unitSales: 3540000000, leasingFee: 38000000, otherRevenue: 22000000 },
  },
  {
    id: 'rev-8',
    monthIndex: 8,
    monthName: 'Agustus',
    targetOmzet: 5000000000,
    realisasiOmzet: 0,
    targetLaba: 550000000,
    realisasiLaba: 0,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 0,
    status: 'BELUM',
    streams: { unitSales: 0, leasingFee: 0, otherRevenue: 0 },
  },
  {
    id: 'rev-9',
    monthIndex: 9,
    monthName: 'September',
    targetOmzet: 5000000000,
    realisasiOmzet: 0,
    targetLaba: 550000000,
    realisasiLaba: 0,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 0,
    status: 'BELUM',
    streams: { unitSales: 0, leasingFee: 0, otherRevenue: 0 },
  },
  {
    id: 'rev-10',
    monthIndex: 10,
    monthName: 'Oktober',
    targetOmzet: 5000000000,
    realisasiOmzet: 0,
    targetLaba: 550000000,
    realisasiLaba: 0,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 0,
    status: 'BELUM',
    streams: { unitSales: 0, leasingFee: 0, otherRevenue: 0 },
  },
  {
    id: 'rev-11',
    monthIndex: 11,
    monthName: 'November',
    targetOmzet: 5000000000,
    realisasiOmzet: 0,
    targetLaba: 550000000,
    realisasiLaba: 0,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 0,
    status: 'BELUM',
    streams: { unitSales: 0, leasingFee: 0, otherRevenue: 0 },
  },
  {
    id: 'rev-12',
    monthIndex: 12,
    monthName: 'Desember',
    targetOmzet: 5000000000,
    realisasiOmzet: 0,
    targetLaba: 550000000,
    realisasiLaba: 0,
    targetLeasingFee: 50000000,
    realisasiLeasingFee: 0,
    status: 'BELUM',
    streams: { unitSales: 0, leasingFee: 0, otherRevenue: 0 },
  },
];

export const TargetPendapatanPage = () => {
  const [year, setYear] = useState('2026');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [targets, setTargets] = useState<MonthlyRevenueTarget[]>(INITIAL_REVENUE_TARGETS);

  // Modal State
  const [editModal, setEditModal] = useState<MonthlyRevenueTarget | null>(null);
  const [formOmzet, setFormOmzet] = useState('');
  const [formLaba, setFormLaba] = useState('');
  const [formLeasingFee, setFormLeasingFee] = useState('');

  const openEdit = (m: MonthlyRevenueTarget) => {
    setEditModal(m);
    setFormOmzet(m.targetOmzet.toString());
    setFormLaba(m.targetLaba.toString());
    setFormLeasingFee(m.targetLeasingFee.toString());
  };

  const handleSaveTarget = (e: FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    const omzetVal = Number(formOmzet) || 0;
    const labaVal = Number(formLaba) || 0;
    const leasingVal = Number(formLeasingFee) || 0;

    setTargets((prev) =>
      prev.map((t) =>
        t.id === editModal.id
          ? { ...t, targetOmzet: omzetVal, targetLaba: labaVal, targetLeasingFee: leasingVal }
          : t
      )
    );
    setEditModal(null);
  };

  const columns: Column<MonthlyRevenueTarget>[] = [
    { header: 'Bulan', cell: (m) => <span className="font-extrabold text-ink text-sm">{m.monthName}</span> },
    { header: 'Target Omzet', align: 'right', cell: (m) => <span className="font-extrabold text-primary">{formatCurrency(m.targetOmzet, { compact: true })}</span> },
    { header: 'Realisasi Omzet', align: 'right', cell: (m) => (
      <span className={`font-extrabold ${m.realisasiOmzet >= m.targetOmzet ? 'text-accent-green' : m.status === 'BELUM' ? 'text-muted' : 'text-accent-amber'}`}>
        {m.status === 'BELUM' ? '-' : formatCurrency(m.realisasiOmzet, { compact: true })}
      </span>
    )},
    { header: 'Pencapaian', align: 'center', cell: (m) => {
      const pct = m.targetOmzet ? Math.round((m.realisasiOmzet / m.targetOmzet) * 100) : 0;
      return (
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
          pct >= 100 ? 'bg-accent-green/15 text-accent-green' : pct >= 70 ? 'bg-accent-blue/15 text-accent-blue' : m.status === 'BELUM' ? 'bg-surface-soft text-muted' : 'bg-accent-amber/15 text-accent-amber'
        }`}>
          {m.status === 'BELUM' ? '-' : `${pct}%`}
        </span>
      );
    }},
    { header: 'Target Margin Laba', align: 'right', cell: (m) => <span className="font-bold text-ink">{formatCurrency(m.targetLaba, { compact: true })}</span> },
    { header: 'Realisasi Laba', align: 'right', cell: (m) => <span className={`font-extrabold ${m.realisasiLaba >= m.targetLaba ? 'text-accent-green' : 'text-ink'}`}>{m.status === 'BELUM' ? '-' : formatCurrency(m.realisasiLaba, { compact: true })}</span> },
    { header: 'Komisi Leasing', align: 'right', cell: (m) => <span className="font-semibold text-muted">{m.status === 'BELUM' ? '-' : formatCurrency(m.realisasiLeasingFee, { compact: true })}</span> },
    { header: 'Status', align: 'center', cell: (m) => {
      const map = {
        SURPLUS: { text: 'SURPLUS', color: 'bg-accent-green/15 text-accent-green border-accent-green/30' },
        TERCAPAI: { text: 'TERCAPAI', color: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30' },
        PERHATIAN: { text: 'PERHATIAN', color: 'bg-accent-amber/15 text-accent-amber border-accent-amber/30' },
        BERJALAN: { text: 'BERJALAN', color: 'bg-primary/15 text-primary border-primary/30' },
        BELUM: { text: 'BELUM MULAI', color: 'bg-surface-soft text-muted border-divider' },
      }[m.status];
      return <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${map.color}`}>{map.text}</span>;
    }},
    { header: 'Aksi', align: 'right', cell: (m) => (
      <Button variant="secondary" size="sm" icon={<Edit3 size={13} />} onClick={() => openEdit(m)}>Edit Target</Button>
    )},
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-float-up pb-12">
      {/* Header & Year Selector Bar */}
      <PageHeader
        title="Manajemen Target Pendapatan & Profitabilitas"
        description="Pengelompokan dan pengaturan target omzet kotor, margin laba unit, serta pendapatan insentif leasing showroom per bulan"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-border shadow-sm">
              <CalendarDays size={16} className="text-primary" />
              <span className="text-[12px] font-bold text-muted">Tahun Buku:</span>
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="bg-transparent text-[12px] font-extrabold text-ink focus:outline-none cursor-pointer pr-1"
              >
                <option value="2026">2026 (Tahun Berjalan)</option>
                <option value="2025">2025 (Periode Lalu)</option>
                <option value="2027">2027 (Proyeksi)</option>
              </select>
            </div>
            <Can any={['REVENUE_TARGET_UPDATE', 'REVENUE_TARGET_CREATE', 'SALES_TARGET_UPDATE', 'REVENUE_TARGET', 'SALES_TARGET']}>
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
          <Award size={20} className="text-accent-green" />
          <div>
            <span className="text-sm font-extrabold text-ink">Evaluasi Pendapatan Showroom {year}: </span>
            <span className="text-sm font-bold text-accent-green">Semester 1 (Jan-Jun) Omzet Rp 30,60 Miliar (102% Target) • Laba Bersih S1 Rp 3,38 Miliar</span>
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

      {/* Main Monthly Revenue Targets Section: Grid Cards or Matrix Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
            <DollarSign size={18} className="text-primary" /> Daftar Target & Realisasi Pendapatan Per Bulan (12 Bulan {year})
          </h3>
          <span className="text-[12px] font-bold text-muted">Klik "Edit Target" untuk menyesuaikan omzet dan margin laba bulanan</span>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {targets.map((m) => {
              const pct = m.targetOmzet ? Math.round((m.realisasiOmzet / m.targetOmzet) * 100) : 0;
              const labaPct = m.targetLaba ? Math.round((m.realisasiLaba / m.targetLaba) * 100) : 0;
              const isSurplus = m.realisasiOmzet >= m.targetOmzet;
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
                        <span className="text-[10px] font-bold text-muted uppercase block">Target Omzet</span>
                        <span className="text-base font-extrabold text-primary block">{formatCurrency(m.targetOmzet, { compact: true })}</span>
                        <span className="text-[10px] font-semibold text-muted block mt-0.5">Laba: {formatCurrency(m.targetLaba, { compact: true })}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase block">Realisasi</span>
                        <span className={`text-base font-extrabold block ${isNotStarted ? 'text-muted' : isSurplus ? 'text-accent-green' : 'text-accent-amber'}`}>
                          {isNotStarted ? '-' : formatCurrency(m.realisasiOmzet, { compact: true })}
                        </span>
                        <span className={`text-[10px] font-extrabold block mt-0.5 ${isNotStarted ? 'text-muted' : m.realisasiLaba >= m.targetLaba ? 'text-accent-green' : 'text-ink'}`}>
                          {isNotStarted ? '-' : `Laba: ${formatCurrency(m.realisasiLaba, { compact: true })}`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Omzet */}
                    <div className="pt-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-muted">Pencapaian Omzet</span>
                        <span className={isNotStarted ? 'text-muted' : isSurplus ? 'text-accent-green font-extrabold' : 'text-ink'}>
                          {isNotStarted ? 'Belum Berjalan' : `${pct}% Tercapai`}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-soft overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isNotStarted ? 'bg-transparent' : isSurplus ? 'bg-accent-green' : pct >= 80 ? 'bg-primary' : 'bg-accent-amber'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Revenue Streams Breakdown */}
                    {!isNotStarted && (
                      <div className="mt-4 pt-3 border-t border-divider/60 space-y-1.5 text-[11px]">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted block mb-1">Rincian Sumber Pendapatan</span>
                        <div className="flex items-center justify-between">
                          <span className="text-muted font-medium">Penjualan Unit:</span>
                          <span className="font-extrabold text-ink">{formatCurrency(m.streams.unitSales, { compact: true })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted font-medium">Komisi / Fee Leasing:</span>
                          <span className="font-extrabold text-accent-green">{formatCurrency(m.streams.leasingFee, { compact: true })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted font-medium">Jasa & Adm Lainnya:</span>
                          <span className="font-semibold text-muted">{formatCurrency(m.streams.otherRevenue, { compact: true })}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-divider flex items-center justify-between gap-2">
                    <div className="text-[10px] font-semibold text-muted">
                      {isNotStarted ? 'Target dapat disesuaikan' : `Margin Laba: ${labaPct}% Target`}
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={<Edit3 size={13} />}
                      onClick={() => openEdit(m)}
                      className="text-[11px] h-7 px-2.5 font-bold hover:border-primary hover:text-primary"
                    >
                      Edit Target
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <DataTable<MonthlyRevenueTarget> columns={columns} data={targets} rowKey={(item) => item.id} />
          </div>
        )}
      </div>

      {/* Modal Edit Target Pendapatan Bulanan */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal ? `Edit Target Pendapatan — Bulan ${editModal.monthName} ${year}` : ''}
        className="max-w-md"
      >
        {editModal && (
          <form onSubmit={handleSaveTarget} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs font-semibold text-ink flex items-center justify-between">
              <span>Bulan: <strong className="text-primary">{editModal.monthName} {year}</strong></span>
              <span className="text-muted">Realisasi Omzet: <strong className="text-ink">{formatCurrency(editModal.realisasiOmzet, { compact: true })}</strong></span>
            </div>

            <TextField
              label="Target Omzet Penjualan (Rp)"
              type="number"
              value={formOmzet}
              onChange={(e) => setFormOmzet(e.target.value)}
              placeholder="Contoh: 5000000000"
              required
            />

            <TextField
              label="Target Laba Kotor / Margin (Rp)"
              type="number"
              value={formLaba}
              onChange={(e) => setFormLaba(e.target.value)}
              placeholder="Contoh: 550000000"
              required
            />

            <TextField
              label="Target Komisi & Insentif Leasing (Rp)"
              type="number"
              value={formLeasingFee}
              onChange={(e) => setFormLeasingFee(e.target.value)}
              placeholder="Contoh: 50000000"
              required
            />

            <div className="pt-3 border-t border-divider flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditModal(null)}>Batal</Button>
              <Button type="submit" className="bg-primary text-white font-extrabold hover:bg-primary/90">
                Simpan Target Pendapatan
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
