import { useState } from 'react';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { useCrmAnalyticsLogs } from '../crmAnalytics.hooks';
import type { VisitorLogRow } from '../crmAnalytics.types';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import {
  ListFilter,
  Smartphone,
  Monitor,
  Tablet,
  Eye,
  Car,
  MessageSquareShare,
  PhoneCall,
  Share2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '@/core/utils/format';

interface VisitorLogsTableProps {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
}

const EVENT_BADGES: Record<
  string,
  { label: string; bg: string; text: string; icon: typeof Eye }
> = {
  PAGE_VIEW: {
    label: 'Buka Halaman',
    bg: 'bg-primary/10',
    text: 'text-primary',
    icon: Eye,
  },
  UNIT_VIEW: {
    label: 'Lihat Mobil',
    bg: 'bg-accent-orange/10',
    text: 'text-accent-orange',
    icon: Car,
  },
  WHATSAPP_CLICK: {
    label: 'Chat Sales WA',
    bg: 'bg-accent-green/10',
    text: 'text-accent-green',
    icon: MessageSquareShare,
  },
  PHONE_CLICK: {
    label: 'Telepon Sales',
    bg: 'bg-accent-blue/10',
    text: 'text-accent-blue',
    icon: PhoneCall,
  },
  SHARE_CLICK: {
    label: 'Bagikan Mobil',
    bg: 'bg-accent-purple/10',
    text: 'text-accent-purple',
    icon: Share2,
  },
};

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return '< 5 dtk';
  if (seconds < 60) return `${seconds} dtk`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} mnt ${secs > 0 ? `${secs} dtk` : ''}`;
};

export const VisitorLogsTable = ({ period, dateFrom, dateTo }: VisitorLogsTableProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState<string>('ALL');

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isError, refetch } = useCrmAnalyticsLogs({
    page,
    limit,
    search: debouncedSearch,
    eventType: eventType === 'ALL' ? undefined : eventType,
    period,
    dateFrom,
    dateTo,
  });

  const logs = data?.data ?? [];

  const columns: Column<VisitorLogRow>[] = [
    {
      header: 'Waktu Kunjungan',
      cell: (r) => {
        const d = new Date(r.createdAt);
        return (
          <div className="space-y-0.5">
            <p className="font-bold text-ink text-[12px]">{formatDate(r.createdAt)}</p>
            <p className="text-[11px] font-mono text-muted flex items-center gap-1">
              <Clock size={11} />
              {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Pengunjung & Perangkat',
      cell: (r) => {
        const DeviceIcon =
          r.deviceType === 'MOBILE' ? Smartphone : r.deviceType === 'TABLET' ? Tablet : Monitor;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-soft border border-border text-ink-soft">
                {r.visitorId.slice(0, 12)}...
              </span>
            </div>
            <p className="text-[11px] font-semibold text-muted flex items-center gap-1">
              <DeviceIcon size={12} className="text-ink-soft shrink-0" />
              <span>{r.browser} · {r.os}</span>
            </p>
          </div>
        );
      },
    },
    {
      header: 'Aktivitas',
      cell: (r) => {
        const badge = EVENT_BADGES[r.eventType] || {
          label: r.eventType,
          bg: 'bg-surface-soft',
          text: 'text-ink-soft',
          icon: Eye,
        };
        const Icon = badge.icon;

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${badge.bg} ${badge.text}`}
          >
            <Icon size={13} strokeWidth={2.2} />
            <span>{badge.label}</span>
          </span>
        );
      },
    },
    {
      header: 'Halaman / Unit Mobil',
      cell: (r) => {
        const targetUrl = r.unit?.id ? `/katalog/${r.unit.id}` : (r.pagePath || '/');

        if (r.unit) {
          return (
            <div className="flex items-center gap-2">
              <div className="min-w-0">
                <p className="font-bold text-ink text-[12px] truncate">{r.unit.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] font-bold text-muted">{r.unit.platNomor}</span>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-[11px] font-bold inline-flex items-center gap-1"
                    title={`Buka ${targetUrl} di tab baru`}
                  >
                    <span>Buka Unit</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-ink-soft text-[12px] font-mono truncate max-w-xs" title={r.pagePath}>
                {r.pagePath}
              </p>
              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline text-[11px] font-bold inline-flex items-center gap-1 shrink-0"
                title={`Buka ${targetUrl} di tab baru`}
              >
                <span>Buka</span>
                <ExternalLink size={11} />
              </a>
            </div>
            {r.pageTitle && (
              <p className="text-[10px] font-semibold text-muted truncate max-w-xs mt-0.5">{r.pageTitle}</p>
            )}
          </div>
        );
      },
    },
    {
      header: 'Durasi',
      cell: (r) => (
        <span className="text-[11px] font-bold text-muted">
          {formatDuration(r.durationSeconds)}
        </span>
      ),
    },
    {
      header: 'Rujukan (Referrer)',
      cell: (r) => {
        const ref = r.referrer;
        if (!ref || ref === 'direct') return <span className="text-[11px] font-semibold text-muted">Langsung (Direct)</span>;
        try {
          const host = new URL(ref).hostname;
          return <span className="text-[11px] font-semibold text-primary">{host}</span>;
        } catch {
          return <span className="text-[11px] font-semibold text-muted truncate max-w-[120px]">{ref}</span>;
        }
      },
    },
    {
      header: 'Aksi',
      cell: (r) => {
        const targetUrl = r.unit?.id ? `/katalog/${r.unit.id}` : (r.pagePath || '/');
        return (
          <a
            href={targetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-soft border border-border text-primary hover:bg-primary hover:text-white hover:border-primary font-bold text-[11px] transition-all whitespace-nowrap shadow-sm"
            title={`Buka ${targetUrl} di tab baru`}
          >
            <span>Buka Halaman</span>
            <ExternalLink size={12} />
          </a>
        );
      },
    },
  ];

  const filterOptions = [
    { value: 'ALL', label: 'Semua Aktivitas' },
    { value: 'PAGE_VIEW', label: 'Buka Halaman' },
    { value: 'UNIT_VIEW', label: 'Lihat Detail Mobil' },
    { value: 'WHATSAPP_CLICK', label: 'Chat WhatsApp' },
    { value: 'PHONE_CLICK', label: 'Telepon' },
    { value: 'SHARE_CLICK', label: 'Bagikan Mobil' },
  ];

  return (
    <SectionCard
      title="Log Aktivitas Pengunjung Real-Time"
      subtitle="Jejak penelusuran setiap calon pembeli di katalog & landing page showroom"
      icon={<ListFilter size={18} />}
      bodyClassName="p-0"
    >
      {/* Filters Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Cari URL, unit, atau ID..."
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setEventType(opt.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                eventType === opt.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-soft border border-border text-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-4">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-muted font-semibold text-sm">
          Gagal memuat log aktivitas pengunjung.
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-muted font-semibold text-sm">
          {debouncedSearch
            ? 'Tidak ditemukan log pengunjung dengan kata kunci pencarian tersebut.'
            : 'Belum ada rekaman aktivitas pengunjung pada rentang waktu ini.'}
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={logs}
            rowKey={(r) => r.id}
            error={isError}
            onRetry={() => refetch()}
          />
          <div className="p-4 border-t border-border">
            <Pagination
              meta={data?.meta}
              page={page}
              onChange={setPage}
              limit={limit}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
              itemLabel="aktivitas"
            />
          </div>
        </>
      )}
    </SectionCard>
  );
};
