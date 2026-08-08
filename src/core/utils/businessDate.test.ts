import { afterEach, describe, expect, it, vi } from 'vitest';
import { businessToday, toBusinessDate } from './businessDate';

describe('businessToday', () => {
  afterEach(() => vi.useRealTimers());

  it('menggunakan tanggal Asia/Bangkok ketika tanggal UTC masih hari sebelumnya', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-07T18:00:00Z'));

    expect(businessToday()).toBe('2026-08-08');
  });

  it('menampilkan ISO UTC sebagai tanggal kalender Bangkok', () => {
    expect(toBusinessDate('2026-08-07T17:00:00.000Z')).toBe('2026-08-08');
  });
});
