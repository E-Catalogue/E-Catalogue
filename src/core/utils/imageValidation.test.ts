import { describe, expect, it } from 'vitest';
import { IMAGE_UPLOAD_NOTE, MAX_IMAGE_BYTES, validateImageFile } from './imageValidation';

describe('validasi ukuran gambar', () => {
  it('membatasi 2 MB untuk setiap gambar', () => {
    expect(MAX_IMAGE_BYTES).toBe(2 * 1024 * 1024);
    expect(IMAGE_UPLOAD_NOTE).toContain('per gambar');
  });

  it('menyebut nama dan ukuran file yang terlalu besar', () => {
    const file = new File([new Uint8Array(10 * 1024 * 1024)], 'mobil-depan.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(file)).toBe('Gambar “mobil-depan.jpg” berukuran 10,0 MB. Ukuran maksimal 2 MB per gambar.');
  });

  it('menerima beberapa gambar bila masing-masing tidak melebihi batas', () => {
    const first = new File([new Uint8Array(MAX_IMAGE_BYTES)], 'depan.jpg', { type: 'image/jpeg' });
    const second = new File([new Uint8Array(MAX_IMAGE_BYTES)], 'belakang.png', { type: 'image/png' });
    expect(validateImageFile(first)).toBeNull();
    expect(validateImageFile(second)).toBeNull();
  });
});
