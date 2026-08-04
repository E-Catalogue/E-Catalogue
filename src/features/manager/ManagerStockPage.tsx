import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Car, Eye, Search, Share2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { RequirePermission } from '@/features/auth/permissions';
import { formatCurrency } from '@/core/utils/format';
import { API_ORIGIN } from '@/core/api/client';
import { managerApi } from './manager.api';
import { buildManagerUnitWhatsAppUrl } from './manager.whatsapp';
import type { ManagerUnit, ManagerUnitStatus } from './manager.types';

const STATUS_OPTIONS: { value: '' | ManagerUnitStatus; label: string }[] = [
  { value: '', label: 'Semua status' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'RECONDITIONING', label: 'Rekondisi' },
  { value: 'READY_STOCK', label: 'Ready Stock' },
  { value: 'HOLD', label: 'Hold' },
  { value: 'SOLD', label: 'Terjual' },
];

function ManagerUnitDetail({ unit, onClose }: { unit: ManagerUnit; onClose: () => void }) {
  const canShare = unit.canShare && !!buildManagerUnitWhatsAppUrl(unit);
  const image = unit.images[0];
  return <Modal open onClose={onClose} title="Detail Stok Mobil" subtitle={unit.branch.nama} icon={<Car size={18} />} size="lg"
    footer={<><Button variant="secondary" onClick={onClose}>Tutup</Button>{canShare && <Button onClick={() => window.open(buildManagerUnitWhatsAppUrl(unit)!, '_blank', 'noopener,noreferrer')}><Share2 size={15} /> Bagikan WhatsApp</Button>}</>}>
    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <div className="rounded-2xl overflow-hidden bg-surface-soft border border-border aspect-[4/3]">
        {image ? <img className="w-full h-full object-cover" src={`${API_ORIGIN}/public/unit/${image.filename}`} alt={unit.name} /> : <div className="h-full flex items-center justify-center text-muted"><Car size={36} /></div>}
      </div>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3"><div><h4 className="text-lg font-extrabold text-ink">{unit.name}</h4><p className="text-sm text-muted mt-1">{[unit.merek?.name, unit.tipe?.name, unit.variant].filter(Boolean).join(' ')}</p></div><StatusBadge status={unit.statusUnit} /></div>
        {unit.otrPrice !== null && <div className="rounded-xl bg-primary-light px-4 py-3"><p className="text-[10px] uppercase font-bold tracking-wide text-muted">Harga OTR</p><p className="mt-1 text-lg font-extrabold text-primary">{formatCurrency(unit.otrPrice)}</p></div>}
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
          <p><span className="text-muted">Tahun</span><br /><b>{unit.tahun}</b></p><p><span className="text-muted">Plat</span><br /><b>{unit.platNomor}</b></p>
          <p><span className="text-muted">Warna</span><br /><b>{unit.warna || '-'}</b></p><p><span className="text-muted">Transmisi</span><br /><b>{unit.transmisi}</b></p>
          <p><span className="text-muted">Kilometer</span><br /><b>{unit.kilometer.toLocaleString('id-ID')} km</b></p><p><span className="text-muted">Pajak</span><br /><b>{unit.tanggalPajak ? new Date(unit.tanggalPajak).toLocaleDateString('id-ID') : '-'}</b></p>
        </div>
      </div>
    </div>
    <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm"><div><p className="font-bold text-ink mb-1">Kelengkapan</p><p className="text-muted">{unit.kelengkapans.map((x) => x.name).join(', ') || '-'}</p></div><div><p className="font-bold text-ink mb-1">Dokumen</p><p className="text-muted">{unit.dokumens.map((x) => x.name).join(', ') || '-'}</p></div></div>
    {unit.deskripsi && <div className="mt-4"><p className="font-bold text-ink mb-1 text-sm">Deskripsi</p><p className="text-sm text-muted whitespace-pre-wrap">{unit.deskripsi}</p></div>}
  </Modal>;
}

function ManagerStockContent() {
  const [search, setSearch] = useState('');
  const [statusUnit, setStatusUnit] = useState<'' | ManagerUnitStatus>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stock = useQuery({ queryKey: ['manager-stock', search, statusUnit], queryFn: () => managerApi.stock({ page: 1, limit: 100, search: search || undefined, statusUnit: statusUnit || undefined }) });
  const detail = useQuery({ queryKey: ['manager-stock-detail', selectedId], queryFn: () => managerApi.stockDetail(selectedId!), enabled: !!selectedId });
  const share = (unit: ManagerUnit) => { const url = buildManagerUnitWhatsAppUrl(unit); if (url) window.open(url, '_blank', 'noopener,noreferrer'); };
  const columns: Column<ManagerUnit>[] = [
    { header: 'Mobil', cell: (u) => <div><p className="font-bold text-ink">{u.name}</p><p className="text-[11px] text-muted">{[u.merek?.name, u.tipe?.name, u.tahun].filter(Boolean).join(' · ')}</p></div> },
    { header: 'Plat', cell: (u) => u.platNomor },
    { header: 'Status', cell: (u) => <StatusBadge status={u.statusUnit} /> },
    { header: 'Harga OTR', cell: (u) => u.otrPrice === null ? '-' : formatCurrency(u.otrPrice), align: 'right' },
    { header: 'Aksi', align: 'right', cell: (u) => <div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => setSelectedId(u.id)} aria-label="Lihat detail"><Eye size={16} /></Button>{u.canShare && <Button size="sm" variant="ghost" onClick={() => share(u)} aria-label="Bagikan WhatsApp"><Share2 size={16} /></Button>}</div> },
  ];
  return <><PageHeader title="Stok Mobil" description="Stok operasional cabang Anda. Informasi biaya dan transaksi tidak ditampilkan." />
    <SectionCard><div className="mb-4 flex flex-col gap-3 sm:flex-row"><label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-border bg-surface-soft px-3"><Search size={16} className="text-muted" /><input className="w-full bg-transparent text-sm outline-none" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari mobil atau plat nomor" /></label><select className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-semibold" value={statusUnit} onChange={(e) => setStatusUnit(e.target.value as '' | ManagerUnitStatus)}>{STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
      <DataTable columns={columns} data={stock.data?.data ?? []} rowKey={(u) => u.id} loading={stock.isLoading} error={stock.isError} onRetry={() => stock.refetch()} emptyState={{ icon: Car, title: 'Tidak ada stok', description: 'Tidak ada unit yang sesuai pada cabang Anda.' }} />
    </SectionCard>{selectedId && detail.data?.data && <ManagerUnitDetail unit={detail.data.data} onClose={() => setSelectedId(null)} />}</>;
}

export function ManagerStockPage() { return <RequirePermission code="UNIT_STOCK_READ"><ManagerStockContent /></RequirePermission>; }
