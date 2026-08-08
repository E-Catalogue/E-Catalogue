import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImageUpload } from './ImageUpload';

describe('ImageUpload', () => {
  it('menghormati rasio dan mode contain agar bukti serah-terima tidak terpotong', () => {
    render(<ImageUpload previewUrl="/handover.jpg" onFile={() => undefined} aspect="aspect-[4/3]" fit="contain" />);

    const image = screen.getByRole('img', { name: 'preview' });
    expect(image).toHaveClass('object-contain');
    expect(image.parentElement).toHaveClass('aspect-[4/3]');
    expect(image).not.toHaveClass('object-cover');
  });
});
