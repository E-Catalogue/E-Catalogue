import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestimoniPublicPage } from './TestimoniPublicPage';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: Record<string, unknown> & { children?: React.ReactNode; to?: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

const mockTestimonial = {
  id: 't-1',
  name: 'Budi Santoso',
  role: 'Pengusaha',
  title: 'Pelayanan Terbaik',
  city: 'Jakarta',
  text: 'Mobil sangat mulus dan pelayanan luar biasa.',
  rating: 5,
  avatarFilename: null,
  imageFilename: 'handover-1.jpg',
  handoverDate: '2026-08-01T00:00:00.000Z',
  customer: null,
  sales: { id: 's-1', name: 'Andi' },
  unit: {
    id: 'u-1',
    name: 'Honda CR-V',
    platNomor: 'B 1••• XYZ',
    tahun: 2022,
    warna: 'Putih',
    transmisi: 'AUTOMATIC',
    merek: 'Honda',
    tipe: 'CR-V',
    imageFilename: 'crv.jpg',
  },
};

vi.mock('./landing.hooks', () => ({
  usePublicTestimonials: vi.fn(() => ({
    data: {
      data: [mockTestimonial],
      meta: { page: 1, limit: 9, total: 1, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
  usePublicTestimonial: vi.fn(() => ({
    data: mockTestimonial,
    isLoading: false,
  })),
}));

describe('TestimoniPublicPage', () => {
  it('merender header, toolbar pencarian, kartu testimoni, dan pagination', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <TestimoniPublicPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Testimoni & Pengalaman Serah Terima')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Cari nama pembeli/i)).toBeInTheDocument();
    expect(screen.getByText('Pelayanan Terbaik')).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('Honda CR-V · 2022')).toBeInTheDocument();
  });
});
