import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Unit } from './unit.types';

const mocks = vi.hoisted(() => ({ refetch: vi.fn(), mutate: vi.fn(), mutateAsync: vi.fn() }));

vi.mock('./unit.hooks', () => ({
  useUnit: () => ({ data: undefined, refetch: mocks.refetch }),
  useUnitImageMutations: () => ({
    uploadMany: { isPending: false, mutateAsync: mocks.mutateAsync },
    reorder: { isPending: false, mutate: mocks.mutate },
    remove: { isPending: false, mutate: mocks.mutate, mutateAsync: mocks.mutateAsync },
    setMain: { isPending: false, mutate: mocks.mutate },
  }),
  useFinalizeInitialPricing: () => ({ isPending: false, mutate: mocks.mutate }),
  useUpdateUnitFunding: () => ({ isPending: false, mutate: mocks.mutate }),
}));
vi.mock('@/features/auth/usePermissions', () => ({ usePermissions: () => ({ can: () => true }) }));
vi.mock('@/shared/components/ui/ConfirmedActionProvider', () => ({ useConfirmedAction: () => vi.fn() }));
vi.mock('@/shared/components/ui/Modal', () => ({
  Modal: ({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) => (
    <section><h1>{title}</h1>{children}<footer>{footer}</footer></section>
  ),
}));
vi.mock('./UnitGalleryManager', () => ({ UnitGalleryManager: ({ readOnly }: { readOnly?: boolean }) => <div>{readOnly ? 'Galeri Baca Saja' : 'Input Galeri Unit'}</div> }));
vi.mock('@/features/investor-funding/InvestorFundingPanel', () => ({ InvestorFundingPanel: () => <div>Penggunaan Dana Investor</div> }));
vi.mock('@/shared/components/ui/ConfirmDialog', () => ({ ConfirmDialog: () => <div>Dialog Finalisasi Harga</div> }));
vi.mock('@/core/api/client', () => ({ API_ORIGIN: 'http://localhost:3000' }));

import { UnitDetailModal } from './UnitDetailModal';

const unit = {
  id: 'unit-1',
  branchId: 'branch-1',
  name: 'Brio AT',
  platNomor: 'B 124 BC',
  tahun: 2026,
  kilometer: 10_000,
  transmisi: 'AUTOMATIC',
  bahanBakar: 'BENSIN',
  warna: 'Silver',
  tanggalPajak: '2026-08-03',
  purchaseCost: 250_000_000,
  pricingCostBasis: 250_000_000,
  targetPrice: 305_000_000,
  otrPrice: 312_500_000,
  statusUnit: 'INVENTORY',
  createdAt: '2026-08-03T00:00:00.000Z',
  unitImages: [],
  unitKelengkapans: [
    { id: 'equipment-1', perlengkapanId: 'spare-tire', perlengkapan: { id: 'spare-tire', name: 'Ban Serep', code: 'BAN_SEREP' } },
    { id: 'equipment-2', perlengkapanId: 'jack', perlengkapan: { id: 'jack', name: 'Dongkrak', code: 'DONGKRAK' } },
    { id: 'equipment-3', perlengkapanId: 'service-book', perlengkapan: { id: 'service-book', name: 'Buku Service', code: 'BUKU_SERVICE' } },
  ],
  unitDokumens: [
    { id: 'document-1', dokumenId: 'bpkb', dokumen: { id: 'bpkb', name: 'BPKB', code: 'BPKB' } },
    { id: 'document-2', dokumenId: 'stnk', dokumen: { id: 'stnk', name: 'STNK', code: 'STNK' } },
  ],
  leasingOffers: [{
    id: 'offer-1', leasingId: 'leasing-1', tenorMonths: 12, dpAmount: 50_000_000,
    otrPrice: 312_500_000, disbursementAmount: 262_500_000,
    leasing: { id: 'leasing-1', name: 'Mandiri', code: 'MDR', isActive: true },
  }],
  fundingAgreement: { fundingSource: 'INVESTOR', status: 'ACTIVE', investor: { name: 'Investor Satu' } },
} as unknown as Unit;

describe('UnitDetailModal mode Sales dari kartu', () => {
  it('menyembunyikan data internal dan tetap menampilkan informasi penjualan', () => {
    render(<UnitDetailModal open unit={unit} salesView onClose={() => undefined} onEdit={() => undefined} />);

    expect(screen.queryByText('Harga Beli')).not.toBeInTheDocument();
    expect(screen.queryByText('HPP')).not.toBeInTheDocument();
    expect(screen.queryByText('Est. Margin')).not.toBeInTheDocument();
    expect(screen.queryByText('Pendanaan & Harga Awal')).not.toBeInTheDocument();
    expect(screen.queryByText('Penggunaan Dana Investor')).not.toBeInTheDocument();
    expect(screen.queryByText('Input Galeri Unit')).not.toBeInTheDocument();
    expect(screen.queryByText('Inventory')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Unit' })).not.toBeInTheDocument();

    expect(screen.getByText('Status Unit')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    expect(screen.getAllByText('OTR').length).toBeGreaterThan(0);
    expect(screen.getByText('Penawaran Leasing')).toBeInTheDocument();
    expect(screen.getByText('Kelengkapan & Dokumen')).toBeInTheDocument();
    expect(screen.getByText('Ban Serep')).toBeInTheDocument();
    expect(screen.getByText('Dongkrak')).toBeInTheDocument();
    expect(screen.getByText('Buku Service')).toBeInTheDocument();
    expect(screen.getByText('BPKB')).toBeInTheDocument();
    expect(screen.getByText('STNK')).toBeInTheDocument();
    expect(screen.getByText('Galeri Unit')).toBeInTheDocument();
    expect(screen.getByText('Galeri Baca Saja')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bagikan WhatsApp' })).toBeInTheDocument();
  });
});
