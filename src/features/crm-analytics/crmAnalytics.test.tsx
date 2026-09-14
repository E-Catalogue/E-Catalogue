import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnalyticsKpiCards } from './components/AnalyticsKpiCards';
import { DeviceDistributionChart } from './components/DeviceDistributionChart';
import { TopUnitsSection } from './components/TopUnitsSection';
import type { CrmAnalyticsOverview, TopUnitItem } from './crmAnalytics.types';

const mockOverview: CrmAnalyticsOverview = {
  period: '2026-09',
  kpi: {
    totalVisitors: 1250,
    totalPageViews: 8400,
    totalUnitViews: 3200,
    totalInquiries: 310,
    conversionRate: 24.8,
    totalShareClicks: 85,
  },
  growth: {
    visitors: 12.5,
    pageViews: 18.2,
    unitViews: 15.0,
    inquiries: 22.4,
    conversionRate: 3.2,
  },
  devices: {
    mobile: 850,
    desktop: 350,
    tablet: 50,
  },
};

const mockTopUnits: TopUnitItem[] = [
  {
    id: 'unit-1',
    name: 'Toyota Avanza 1.3 G M/T',
    merekName: 'Toyota',
    tipeName: 'Avanza',
    platNomor: 'B 1234 CD',
    tahun: 2021,
    warna: 'Hitam Metalik',
    transmisi: 'MANUAL',
    otrPrice: 215000000,
    statusUnit: 'READY_STOCK',
    imageFilename: 'avanza.jpg',
    viewCount: 420,
    inquiryCount: 45,
    inquiryRate: 10.7,
  },
  {
    id: 'unit-2',
    name: 'Honda Brio 1.2 E CVT',
    merekName: 'Honda',
    tipeName: 'Brio',
    platNomor: 'D 5678 EF',
    tahun: 2022,
    warna: 'Putih Mutiara',
    transmisi: 'AUTOMATIC',
    otrPrice: 175000000,
    statusUnit: 'READY_STOCK',
    imageFilename: null,
    viewCount: 310,
    inquiryCount: 32,
    inquiryRate: 10.3,
  },
];

describe('CRM Analytics UI Components', () => {
  it('AnalyticsKpiCards merender seluruh kartu metrik utama', () => {
    render(<AnalyticsKpiCards overview={mockOverview} />);

    expect(screen.getByText('Pengunjung Unik')).toBeInTheDocument();
    expect(screen.getByText('1.250')).toBeInTheDocument();

    expect(screen.getByText('Kunjungan Halaman')).toBeInTheDocument();
    expect(screen.getByText('8.400')).toBeInTheDocument();

    expect(screen.getByText('Minat Unit Mobil')).toBeInTheDocument();
    expect(screen.getByText('3.200')).toBeInTheDocument();

    expect(screen.getByText('Lead Inbound (WA)')).toBeInTheDocument();
    expect(screen.getByText('310')).toBeInTheDocument();

    expect(screen.getByText('Tingkat Konversi')).toBeInTheDocument();
    expect(screen.getByText('24.8%')).toBeInTheDocument();
  });

  it('DeviceDistributionChart menghitung persentase perangkat dengan tepat', () => {
    render(<DeviceDistributionChart devices={mockOverview.devices} />);

    expect(screen.getByText('Perangkat Pengunjung')).toBeInTheDocument();
    expect(screen.getByText('Smartphone / Mobile')).toBeInTheDocument();
    expect(screen.getByText('Komputer / Laptop')).toBeInTheDocument();
    expect(screen.getByText('Tablet / iPad')).toBeInTheDocument();

    // 850 / 1250 = 68%
    expect(screen.getByText('68%')).toBeInTheDocument();
    // 350 / 1250 = 28%
    expect(screen.getByText('28%')).toBeInTheDocument();
  });

  it('TopUnitsSection menampilkan ranking unit mobil terpopuler', () => {
    render(<TopUnitsSection units={mockTopUnits} />);

    expect(screen.getByText('Unit Mobil Paling Banyak Dilihat')).toBeInTheDocument();
    expect(screen.getByText('Toyota Avanza 1.3 G M/T')).toBeInTheDocument();
    expect(screen.getByText('Honda Brio 1.2 E CVT')).toBeInTheDocument();
    expect(screen.getByText('B 1234 CD')).toBeInTheDocument();
    expect(screen.getByText('D 5678 EF')).toBeInTheDocument();
  });
});
