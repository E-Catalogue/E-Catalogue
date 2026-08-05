import { describe, expect, it } from 'vitest';
import { resolveInventoryView } from './inventory.view';

describe('resolveInventoryView', () => {
  it('memaksa mode kartu untuk permission Inventori mode kartu', () => {
    expect(resolveInventoryView(true, 'table', false)).toBe('card');
  });

  it('mempertahankan preferensi tabel atau kartu untuk Inventori penuh', () => {
    expect(resolveInventoryView(false, 'table', true)).toBe('table');
    expect(resolveInventoryView(false, 'card', false)).toBe('card');
  });
});
