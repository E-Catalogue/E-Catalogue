import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogCard } from './public.types';
import { HeroUnitCarousel } from './HeroUnitCarousel';

const unit = (id: string, name: string): CatalogCard => ({
  id,
  name,
  code: id,
  merek: null,
  tipe: null,
  variant: null,
  tahun: 2024,
  harga: 250_000_000,
  kilometer: 10_000,
  transmisi: 'AT',
  bahanBakar: 'Bensin',
  warna: 'Hitam',
  statusKatalog: 'READY',
  isNew: false,
  image: null,
  createdAt: '2026-08-08T00:00:00.000Z',
  brand: '',
  model: '',
  year: 2024,
  price: 250_000_000,
  km: 10_000,
  transmission: 'AT',
  fuel: 'Bensin',
  color: 'Hitam',
  status: 'ready',
});

afterEach(() => vi.useRealTimers());

describe('HeroUnitCarousel', () => {
  it('berpindah otomatis ke unit berikutnya setiap lima detik', () => {
    vi.useFakeTimers();
    render(<HeroUnitCarousel units={[unit('u-1', 'Unit Pertama'), unit('u-2', 'Unit Kedua')]} fallbackAlt="Showroom" onView={() => undefined} />);

    expect(document.querySelector('[data-carousel-unit="u-1"][data-active="true"]')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(5_000));

    expect(document.querySelector('[data-carousel-unit="u-2"][data-active="true"]')).toBeInTheDocument();
  });

  it('berpindah melalui tombol next dan memakai gambar default saat unit belum memiliki foto', async () => {
    const user = userEvent.setup();
    render(<HeroUnitCarousel units={[unit('u-1', 'Unit Pertama'), unit('u-2', 'Unit Kedua')]} fallbackAlt="Showroom" onView={() => undefined} />);

    expect(screen.getByAltText('Unit Pertama')).toHaveAttribute('src', expect.stringContaining('images.unsplash.com/photo-1708148246994-b7b3c818090d'));
    await user.click(screen.getByRole('button', { name: 'Unit berikutnya' }));
    expect(document.querySelector('[data-carousel-unit="u-2"][data-active="true"]')).toBeInTheDocument();
  });

  it('membatasi isi slider maksimal lima unit', () => {
    const units = Array.from({ length: 7 }, (_, index) => ({
      ...unit(`u-${index + 1}`, `Unit ${index + 1}`),
      createdAt: `2026-08-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
    }));
    render(<HeroUnitCarousel units={units} fallbackAlt="Showroom" onView={() => undefined} />);

    expect(screen.getAllByRole('button', { name: /^Tampilkan Unit/ })).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Tampilkan Unit 7' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tampilkan Unit 2' })).not.toBeInTheDocument();
  });

  it('memprioritaskan Ready Stock dan menampilkan label transmisi lengkap', () => {
    const soldNewest = { ...unit('sold-new', 'Sold Terbaru'), status: 'sold' as const, statusUnit: 'SOLD', transmisi: 'MT' as const, createdAt: '2026-08-08T00:00:00.000Z' };
    const readyOlder = { ...unit('ready-old', 'Ready Lebih Lama'), status: 'ready' as const, statusUnit: 'READY_STOCK', transmisi: 'AT' as const, createdAt: '2026-08-01T00:00:00.000Z' };

    render(<HeroUnitCarousel units={[soldNewest, readyOlder]} fallbackAlt="Showroom" onView={() => undefined} />);

    expect(document.querySelector('[data-carousel-unit="ready-old"][data-active="true"]')).toBeInTheDocument();
    expect(screen.getAllByText(/2024 · Automatic/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Harga').length).toBeGreaterThan(0);
    expect(screen.queryByText('Harga OTR')).not.toBeInTheDocument();
  });
});
