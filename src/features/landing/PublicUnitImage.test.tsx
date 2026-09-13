import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { PublicUnitImage } from './PublicUnitImage';

describe('PublicUnitImage', () => {
  it('menampilkan foto utuh dengan backdrop untuk sumber portrait maupun landscape', () => {
    const { container, rerender } = render(<PublicUnitImage src="/portrait.jpg" alt="Unit portrait" />);

    expect(screen.getByRole('img', { name: 'Unit portrait' })).toHaveClass('object-contain');
    expect(container.querySelector('img[aria-hidden="true"]')).toHaveClass('object-cover', 'blur-xl');

    rerender(<PublicUnitImage src="/landscape.jpg" alt="Unit landscape" />);
    expect(screen.getByRole('img', { name: 'Unit landscape' })).toHaveAttribute('src', '/landscape.jpg');
  });

  it('menggunakan fallback ketika gambar gagal dimuat', () => {
    render(<PublicUnitImage src="/rusak.jpg" alt="Unit" />);
    const image = screen.getByRole('img', { name: 'Unit' });

    fireEvent.error(image);

    expect(image).toHaveAttribute('src', DEFAULT_CAR_IMAGE);
  });
});
