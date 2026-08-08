import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PublicTestimonial } from './public.types';
import { TestimonialCarousel } from './TestimonialCarousel';

const testimonial = (index: number): PublicTestimonial => ({
  id: `testimonial-${index}`,
  name: `Pelanggan ${index}`,
  role: null,
  title: `Cerita ${index}`,
  city: 'Jakarta',
  text: `Pengalaman pelanggan ${index}`,
  rating: 5,
  avatarFilename: null,
  imageFilename: `handover-${index}.jpg`,
  handoverDate: `2026-08-0${index}T00:00:00.000Z`,
  createdAt: `2026-08-0${index}T00:00:00.000Z`,
  customer: null,
  sales: null,
  unit: null,
});

describe('TestimonialCarousel', () => {
  it('mengurutkan terbaru dan membatasi maksimal lima testimoni', () => {
    render(<TestimonialCarousel testimonials={Array.from({ length: 6 }, (_, index) => testimonial(index + 1))} onView={() => undefined} />);

    expect(screen.getAllByRole('img', { name: /Serah terima unit kepada/ })).toHaveLength(5);
    expect(screen.getByText('Cerita 6')).toBeInTheDocument();
    expect(screen.queryByText('Cerita 1')).not.toBeInTheDocument();
  });
});
