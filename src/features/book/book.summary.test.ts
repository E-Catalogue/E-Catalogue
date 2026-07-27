import { describe, expect, it } from 'vitest';
import { findBookSnapshot } from './book.summary';
import type { BookPeriod } from './book.types';

const closed = { id: 'period-1', branchId: 'branch-1', period: '2026-06', status: 'CLOSED', unitSold: 3 } as BookPeriod;

describe('sumber ringkasan pembukuan', () => {
  it('memakai snapshot untuk cabang konkret yang sudah ditutup', () => {
    expect(findBookSnapshot([closed], '2026-06', false, null)).toBe(closed);
  });

  it('tetap memakai data berjalan untuk Owner tanpa cabang terpilih', () => {
    expect(findBookSnapshot([closed], '2026-06', true, null)).toBeUndefined();
  });

  it('tidak memakai snapshot untuk periode yang belum ditutup', () => {
    expect(findBookSnapshot([{ ...closed, status: 'OPEN' }], '2026-06', true, 'branch-1')).toBeUndefined();
  });
});
