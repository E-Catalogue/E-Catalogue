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

    expect(screen.getByText('Unit Pertama')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(5_000));

    expect(screen.getByText('Unit Kedua')).toBeInTheDocument();
  });

  it('berpindah melalui tombol next dan memakai gambar default saat unit belum memiliki foto', async () => {
    const user = userEvent.setup();
    render(<HeroUnitCarousel units={[unit('u-1', 'Unit Pertama'), unit('u-2', 'Unit Kedua')]} fallbackAlt="Showroom" onView={() => undefined} />);

    expect(screen.getByAltText('Unit Pertama')).toHaveAttribute('src', expect.stringContaining('images.unsplash.com/photo-1708148246994-b7b3c818090d'));
    await user.click(screen.getByRole('button', { name: 'Unit berikutnya' }));
    expect(screen.getByText('Unit Kedua')).toBeInTheDocument();
  });
});
