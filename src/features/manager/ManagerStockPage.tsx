import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Cog,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Fuel,
  Gauge,
  Hash,
  Layers,
  Palette,
  Receipt,
  Share2,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { SearchableSelect, type SearchableSelectOption } from '@/shared/components/ui/SearchableSelect';
import { ActionMenu, type ActionItem } from '@/shared/components/ui/ActionMenu';
import { Pagination } from '@/shared/components/ui/Pagination';
import { RequirePermission } from '@/features/auth/permissions';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { API_ORIGIN } from '@/core/api/client';
import { WEBSITE_URL } from '@/core/utils/whatsapp';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { managerApi } from './manager.api';
import { buildManagerUnitWhatsAppUrl } from './manager.whatsapp';
import type { ManagerUnit, ManagerUnitStatus } from './manager.types';

const STATUS_OPTIONS: SearchableSelectOption[] = [
  { value: '', label: 'Semua Status' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'RECONDITIONING', label: 'Rekondisi' },
  { value: 'READY_STOCK', label: 'Ready Stock' },
  { value: 'HOLD', label: 'Hold' },
  { value: 'SOLD', label: 'Terjual' },
];

const SpecCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2.5 rounded-xl bg-surface-soft p-3 border border-border/50">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary">
      <Icon size={16} strokeWidth={2.2} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="truncate text-[13px] font-bold text-ink">{value}</p>
    </div>
  </div>
);

function ManagerUnitDetail({ unit, onClose }: { unit: ManagerUnit; onClose: () => void }) {
  const images = [...(unit.images ?? [])].sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999));
  const [activeIdx, setActiveIdx] = useState(0);
  const activeImage = images[activeIdx] ?? images[0];
  const canShare = unit.canShare && !!buildManagerUnitWhatsAppUrl(unit);

  const copyUnitInfo = () => {
    const lines = [
      `*${unit.name}*`,
      `Plat: ${unit.platNomor}`,
      `Tahun: ${unit.tahun}`,
      `Warna: ${unit.warna || '-'}`,
      `Transmisi: ${unit.transmisi === 'AUTOMATIC' ? 'Automatic (AT)' : 'Manual (MT)'}`,
      `Kilometer: ${unit.kilometer.toLocaleString('id-ID')} km`,
      `Status: ${unit.statusUnit}`,
      unit.otrPrice !== null ? `Harga OTR: ${formatCurrency(unit.otrPrice)}` : '',
      unit.catalogPath ? `Katalog: ${WEBSITE_URL}${unit.catalogPath}` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Berhasil', message: 'Informasi mobil berhasil disalin!' }));
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={unit.name}
      subtitle={`${unit.platNomor} · ${unit.branch.nama}`}
      icon={<Car size={18} />}
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Copy size={14} />}
              onClick={copyUnitInfo}
            >
              Salin Info
            </Button>
            {unit.catalogPath && (
              <Button
                variant="secondary"
                size="sm"
                icon={<ExternalLink size={14} />}
                onClick={() => window.open(`${WEBSITE_URL}${unit.catalogPath}`, '_blank', 'noopener,noreferrer')}
              >
                Lihat Katalog
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Tutup
            </Button>
            {canShare && (
              <Button
                icon={<Share2 size={15} />}
                onClick={() => window.open(buildManagerUnitWhatsAppUrl(unit)!, '_blank', 'noopener,noreferrer')}
              >
                Bagikan WhatsApp
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header summary & price */}
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr] items-stretch">
          {/* Main Photo Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-surface-soft shadow-inner">
              {activeImage ? (
                <img
                  className="h-full w-full object-cover transition-all duration-300"
                  src={`${API_ORIGIN}/public/unit/${activeImage.filename}`}
                  alt={unit.name}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                  <Car size={42} strokeWidth={1.5} />
                  <span className="text-xs font-medium">Tidak ada foto unit</span>
                </div>
              )}
              {images.length > 1 && (
                <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  {activeIdx + 1} / {images.length}
                </span>
              )}
            </div>

            {/* Thumbnail Carousel / List */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      activeIdx === idx
                        ? 'border-primary shadow-sm ring-2 ring-primary/20 scale-[1.02]'
                        : 'border-border/70 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={`${API_ORIGIN}/public/unit/${img.filename}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info & Pricing */}
          <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-border bg-surface p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted uppercase tracking-wide">
                    <Building2 size={12} className="text-primary" /> {unit.branch.nama}
                  </span>
                  <h3 className="text-lg font-extrabold text-ink leading-tight mt-0.5">{unit.name}</h3>
                  <p className="text-xs text-muted font-semibold mt-0.5">
                    {[unit.merek?.name, unit.tipe?.name, unit.variant].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <StatusBadge status={unit.statusUnit} />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-soft border border-border text-xs font-bold text-ink">
                <span>Plat Nomor:</span>
                <span className="font-extrabold text-primary">{unit.platNomor}</span>
              </div>
            </div>

            {/* OTR Price Banner */}
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Harga OTR (On The Road)
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-primary">
                    {unit.otrPrice !== null ? formatCurrency(unit.otrPrice) : 'Belum Ditentukan'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/30">
                  <Sparkles size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Spesifikasi & Kondisi Mobil</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            <SpecCard icon={Calendar} label="Tahun" value={unit.tahun ? String(unit.tahun) : '-'} />
            <SpecCard
              icon={Cog}
              label="Transmisi"
              value={unit.transmisi === 'AUTOMATIC' ? 'Automatic (AT)' : unit.transmisi === 'MANUAL' ? 'Manual (MT)' : unit.transmisi || '-'}
            />
            <SpecCard
              icon={Gauge}
              label="Kilometer"
              value={unit.kilometer != null ? `${unit.kilometer.toLocaleString('id-ID')} km` : '-'}
            />
            <SpecCard icon={Palette} label="Warna" value={unit.warna || '-'} />
            <SpecCard icon={Fuel} label="Bahan Bakar" value={unit.bahanBakar || 'Bensin'} />
            <SpecCard
              icon={Receipt}
              label="Pajak Berlaku"
              value={unit.tanggalPajak ? formatDate(unit.tanggalPajak) : '-'}
            />
            <SpecCard icon={Building2} label="Cabang" value={unit.branch?.nama || '-'} />
            {unit.variant ? <SpecCard icon={Hash} label="Varian" value={unit.variant} /> : null}
          </div>
        </div>

        {/* Kelengkapan & Dokumen */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Kelengkapan */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-accent-green" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Kelengkapan Unit</h4>
            </div>
            {unit.kelengkapans && unit.kelengkapans.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {unit.kelengkapans.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-surface-soft border border-border/80 px-2.5 py-1 text-xs font-semibold text-ink"
                  >
                    <CheckCircle2 size={12} className="text-accent-green" />
                    {item.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic">Tidak ada catatan kelengkapan.</p>
            )}
          </div>

          {/* Dokumen */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Dokumen Kendaraan</h4>
            </div>
            {unit.dokumens && unit.dokumens.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {unit.dokumens.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-surface-soft border border-border/80 px-2.5 py-1 text-xs font-semibold text-ink"
                  >
                    <FileText size={12} className="text-primary" />
                    {item.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic">Tidak ada catatan dokumen.</p>
            )}
          </div>
        </div>

        {/* Deskripsi Catatan */}
        {unit.deskripsi && (
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Catatan & Deskripsi</h4>
            <p className="text-xs font-medium leading-relaxed text-ink-soft whitespace-pre-wrap">
              {unit.deskripsi}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function ManagerStockContent() {
  const [search, setSearch] = useState('');
  const [statusUnit, setStatusUnit] = useState<'' | ManagerUnitStatus>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const stock = useQuery({
    queryKey: ['manager-stock', page, limit, debouncedSearch, statusUnit],
    queryFn: () => managerApi.stock({
      page,
      limit,
      search: debouncedSearch || undefined,
      statusUnit: statusUnit || undefined,
    }),
  });

  const detail = useQuery({
    queryKey: ['manager-stock-detail', selectedId],
    queryFn: () => managerApi.stockDetail(selectedId!),
    enabled: !!selectedId,
  });

  const share = (unit: ManagerUnit) => {
    const url = buildManagerUnitWhatsAppUrl(unit);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const columns: Column<ManagerUnit>[] = [
    {
      header: 'Mobil',
      cell: (u) => (
        <div>
          <p className="font-bold text-ink text-[13px]">{u.name}</p>
          <p className="text-[11px] text-muted font-medium mt-0.5">
            {[u.merek?.name, u.tipe?.name, u.tahun].filter(Boolean).join(' · ')}
          </p>
        </div>
      ),
    },
    {
      header: 'Plat',
      cell: (u) => <span className="font-bold text-ink-soft text-[13px]">{u.platNomor}</span>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: (u) => <StatusBadge status={u.statusUnit} />,
    },
    {
      header: 'Harga OTR',
      cell: (u) => (
        <span className="font-bold text-primary text-[13px]">
          {u.otrPrice === null ? '-' : formatCurrency(u.otrPrice)}
        </span>
      ),
      align: 'right',
    },
    {
      header: '',
      align: 'right',
      cell: (u) => {
        const items: ActionItem[] = [
          {
            icon: <Eye size={13} />,
            label: 'Lihat Detail',
            onClick: () => setSelectedId(u.id),
            variant: 'primary',
          },
          ...(u.canShare
            ? [
                {
                  icon: <Share2 size={13} />,
                  label: 'Bagikan WhatsApp',
                  onClick: () => share(u),
                },
              ]
            : []),
        ];
        return <ActionMenu items={items} />;
      },
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <PageHeader
        title="Stok Mobil"
        description="Stok operasional cabang Anda. Informasi biaya dan transaksi tidak ditampilkan."
      />
      <SectionCard
        title={`Daftar Stok (${stock.data?.meta?.total ?? stock.data?.data?.length ?? 0})`}
        icon={<Car size={16} />}
        bodyClassName="p-0 md:p-0"
      >
        <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Cari mobil atau plat nomor..."
            className="w-full sm:max-w-xs"
          />
          <div className="w-full sm:w-56">
            <SearchableSelect
              value={statusUnit}
              onChange={(v) => { setStatusUnit(v as '' | ManagerUnitStatus); setPage(1); }}
              options={STATUS_OPTIONS}
              placeholder="Semua Status"
              searchPlaceholder="Cari status..."
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={stock.data?.data ?? []}
          rowKey={(u) => u.id}
          loading={stock.isLoading}
          error={stock.isError}
          onRetry={() => stock.refetch()}
          emptyState={{
            icon: Car,
            title: 'Tidak ada stok',
            description: 'Tidak ada unit yang sesuai pada cabang Anda.',
          }}
        />
        {stock.data?.meta && (stock.data?.data?.length ?? 0) > 0 && (
          <div className="px-4 pb-4 pt-2">
            <Pagination
              meta={stock.data.meta}
              page={page}
              onChange={setPage}
              limit={limit}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
              limitOptions={[10, 15, 25, 50, 100]}
              itemLabel="mobil"
            />
          </div>
        )}
      </SectionCard>
      {selectedId && detail.data?.data && (
        <ManagerUnitDetail unit={detail.data.data} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

export function ManagerStockPage() {
  return (
    <RequirePermission code="UNIT_STOCK_READ">
      <ManagerStockContent />
    </RequirePermission>
  );
}
