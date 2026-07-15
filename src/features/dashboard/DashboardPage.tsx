import { Link } from '@tanstack/react-router';
import {
  Car,
  CalendarClock,
  BookmarkCheck,
  Target,
  ShoppingCart,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { formatCurrency } from '@/core/utils/format';
import { getModule } from '@/features/modules/registry';
import type { MockRow } from '@/features/modules/types';

/**
 * Dashboard Tenant Web (lihat `.menu/tenant-web.md`).
 * Widget masih memakai data mock dari registry modul — sumbernya sama dengan
 * halaman list, jadi angkanya konsisten. Tukar ke API saat endpoint siap.
 */

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint: string;
  tone: string;
}) => (
  <div className="bg-surface rounded-2xl border border-border shadow-card p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
        <p className="text-[24px] font-extrabold text-ink mt-2 leading-none truncate">{value}</p>
        <p className="text-[11px] font-medium text-muted mt-2">{hint}</p>
      </div>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tone}`}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
    </div>
  </div>
);

const rowsOf = (path: string): MockRow[] => getModule(path)?.rows ?? [];

export const DashboardPage = () => {
  const units = rowsOf('/showroom/vehicle-units');
  const testDrives = rowsOf('/showroom/test-drives');
  const reservations = rowsOf('/showroom/reservations');
  const leads = rowsOf('/sales/leads');
  const orders = rowsOf('/sales/orders');
  const purchaseOrders = rowsOf('/purchasing/purchase-orders');
  const receivables = rowsOf('/finance/receivables');
  const payables = rowsOf('/finance/payables');
  const cashBank = rowsOf('/finance/cash-bank');

  const unitTersedia = units.filter((u) => u.status === 'ACTIVE').length;
  const poBelumDiterima = purchaseOrders.filter((p) => p.status !== 'ACTIVE').length;

  const sum = (rows: MockRow[], key: string) =>
    rows.reduce((acc, r) => acc + Number(r[key] ?? 0), 0);

  const piutang = sum(receivables, 'outstanding');
  const utang = sum(payables, 'outstanding');
  const kas = sum(cashBank, 'balance');

  const orderColumns: Column<MockRow>[] = [
    { header: 'Nomor', cell: (r) => <span className="font-mono text-[11px] font-bold text-ink-soft">{String(r.number)}</span> },
    { header: 'Customer', cell: (r) => <span className="font-bold text-ink">{String(r.customer)}</span> },
    { header: 'Unit', cell: (r) => <span className="text-ink-soft font-semibold">{String(r.product)}</span> },
    { header: 'Total', align: 'right', cell: (r) => <span className="font-bold text-ink tabular-nums">{formatCurrency(Number(r.total))}</span> },
    { header: 'Status', align: 'right', cell: (r) => <StatusBadge status={String(r.status)} /> },
  ];

  const tdColumns: Column<MockRow>[] = [
    { header: 'Tanggal', cell: (r) => <span className="text-ink-soft font-semibold">{String(r.date)}</span> },
    { header: 'Customer', cell: (r) => <span className="font-bold text-ink">{String(r.customer)}</span> },
    { header: 'Unit', cell: (r) => <span className="text-ink-soft font-semibold">{String(r.unit)}</span> },
    { header: 'Status', align: 'right', cell: (r) => <StatusBadge status={String(r.status)} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" description="Ringkasan operasional showroom hari ini." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6 stagger">
        <StatCard icon={Car} label="Unit Tersedia" value={unitTersedia} hint={`${units.length} unit terdaftar`} tone="bg-primary-light text-primary" />
        <StatCard icon={CalendarClock} label="Test Drive" value={testDrives.length} hint="Terjadwal & berjalan" tone="bg-accent-blue/10 text-accent-blue" />
        <StatCard icon={BookmarkCheck} label="Reservasi Aktif" value={reservations.length} hint="Unit dipesan pelanggan" tone="bg-accent-purple/10 text-accent-purple" />
        <StatCard icon={Target} label="Lead" value={leads.length} hint="Calon pembeli" tone="bg-accent-amber/10 text-accent-amber" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
        <StatCard icon={ShoppingCart} label="PO Belum Diterima" value={poBelumDiterima} hint={`${purchaseOrders.length} purchase order`} tone="bg-accent-orange/10 text-accent-orange" />
        <StatCard icon={ArrowDownCircle} label="Piutang" value={formatCurrency(piutang, { compact: true })} hint="Belum tertagih" tone="bg-accent-green/10 text-accent-green" />
        <StatCard icon={ArrowUpCircle} label="Utang" value={formatCurrency(utang, { compact: true })} hint="Belum dibayar" tone="bg-semantic-error/10 text-semantic-error" />
        <StatCard icon={Wallet} label="Kas & Bank" value={formatCurrency(kas, { compact: true })} hint="Posisi saat ini" tone="bg-accent-teal/10 text-accent-teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 md:gap-6 items-start">
        <SectionCard
          title="Sales Order Terbaru"
          subtitle="Pesanan penjualan yang berjalan"
          bodyClassName="!p-0"
          action={
            <Link to="/sales/orders" className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
              Lihat semua <ArrowRight size={13} />
            </Link>
          }
        >
          <DataTable columns={orderColumns} data={orders} rowKey={(r) => r.id} />
        </SectionCard>

        <SectionCard
          title="Test Drive"
          subtitle="Jadwal terdekat"
          bodyClassName="!p-0"
          action={
            <Link to="/showroom/test-drives" className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
              Lihat semua <ArrowRight size={13} />
            </Link>
          }
        >
          <DataTable columns={tdColumns} data={testDrives} rowKey={(r) => r.id} />
        </SectionCard>
      </div>
    </div>
  );
};
