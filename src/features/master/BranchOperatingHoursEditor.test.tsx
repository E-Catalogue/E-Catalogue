import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BranchOperatingHoursEditor } from './BranchOperatingHoursEditor';
import { defaultOperatingHours } from './branchHours';

describe('BranchOperatingHoursEditor', () => {
  it('menerapkan timepicker ke seluruh hari yang dipilih', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BranchOperatingHoursEditor value={defaultOperatingHours()} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Pilih semua' }));
    await user.clear(screen.getByLabelText('Jam buka'));
    await user.type(screen.getByLabelText('Jam buka'), '08:00');
    await user.clear(screen.getByLabelText('Jam tutup'));
    await user.type(screen.getByLabelText('Jam tutup'), '18:00');
    await user.click(screen.getByRole('button', { name: 'Terapkan' }));

    const updated = onChange.mock.calls.at(-1)?.[0];
    expect(updated).toHaveLength(7);
    expect(updated.every((item: { isOpen: boolean; openTime: string; closeTime: string }) => item.isOpen && item.openTime === '08:00' && item.closeTime === '18:00')).toBe(true);
  });

  it('menampilkan jadwal tersinkron dalam mode baca tanpa kontrol bulk edit', () => {
    render(<BranchOperatingHoursEditor value={defaultOperatingHours()} onChange={vi.fn()} readOnly />);

    expect(screen.queryByRole('button', { name: 'Pilih semua' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Jam buka Senin')).toBeDisabled();
  });
});
