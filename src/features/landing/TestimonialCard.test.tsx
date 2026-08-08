import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PublicTestimonial } from './public.types';
import { TestimonialCard } from './TestimonialCard';

const testimonial: PublicTestimonial = {
  id: 'testimonial-1',
  name: 'Dani',
  role: 'Pengusaha',
  title: 'Proses pembelian yang nyaman',
  city: 'Jakarta',
  text: 'Tim menjelaskan kondisi unit dengan lengkap dan proses serah terima berjalan lancar.',
  rating: 5,
  avatarFilename: 'avatar.jpg',
  imageFilename: 'handover.jpg',
  handoverDate: '2026-08-08T00:00:00.000Z',
  customer: null,
  sales: { id: 'sales-1', name: 'Raka' },
  unit: {
    id: 'unit-1', name: 'Avanza G', platNomor: 'B 1••• ABC', tahun: 2024, warna: 'Hitam',
    transmisi: 'AUTOMATIC', merek: 'Toyota', tipe: 'Avanza', imageFilename: 'unit.jpg', branch: null,
  },
};

describe('TestimonialCard', () => {
  it('menampilkan foto serah-terima, detail unit, dan membuka cerita', async () => {
    const onView = vi.fn();
    render(<TestimonialCard testimonial={testimonial} onView={onView} />);

    expect(screen.getByRole('img', { name: 'Serah terima unit kepada Dani' })).toHaveAttribute('src', expect.stringContaining('/public/testimoni/handover.jpg'));
    expect(screen.getByText('Avanza G · 2024')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(onView).toHaveBeenCalledOnce();
  });

  it('memakai foto unit ketika foto serah-terima data lama belum tersedia', () => {
    render(<TestimonialCard testimonial={{ ...testimonial, imageFilename: null }} onView={() => undefined} />);

    expect(screen.getByRole('img', { name: 'Serah terima unit kepada Dani' })).toHaveAttribute('src', expect.stringContaining('/public/unit/unit.jpg'));
  });
});
