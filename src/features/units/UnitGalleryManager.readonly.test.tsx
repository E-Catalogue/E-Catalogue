import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UnitGalleryManager } from './UnitGalleryManager';

describe('UnitGalleryManager read-only', () => {
  it('menampilkan foto tanpa kontrol input dan pengelolaan', () => {
    const { container } = render(
      <UnitGalleryManager
        readOnly
        images={[{ id: 'image-1', filename: 'unit.jpg', originalName: 'Brio depan', sequence: 1, isMain: true }]}
      />,
    );

    expect(screen.getByRole('button', { name: 'Lihat foto Brio depan' })).toBeInTheDocument();
    expect(screen.getByText('UTAMA')).toBeInTheDocument();
    expect(screen.queryByText('Seret & letakkan atau klik untuk pilih foto')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Naik')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Turun')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Hapus')).not.toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).not.toBeInTheDocument();
  });
});
