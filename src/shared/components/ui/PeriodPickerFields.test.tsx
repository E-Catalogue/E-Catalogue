import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MonthPickerField, YearPickerField } from './PeriodPickerFields';

describe('MonthPickerField', () => {
  it('menampilkan nama bulan dan menonaktifkan bulan setelah maxMonth', async () => {
    const onChange = vi.fn();
    render(<MonthPickerField value={3} onChange={onChange} maxMonth={5} />);

    expect(screen.getByRole('button', { name: 'Pilih bulan' })).toHaveTextContent('Maret');
    fireEvent.click(screen.getByRole('button', { name: 'Pilih bulan' }));

    expect(await screen.findByRole('button', { name: 'Jun' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Mei' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});

describe('YearPickerField', () => {
  it('memilih tahun dan menonaktifkan tahun setelah maxYear', async () => {
    const onChange = vi.fn();
    render(<YearPickerField value={2025} onChange={onChange} maxYear={2026} />);

    fireEvent.click(screen.getByRole('button', { name: 'Pilih tahun' }));
    expect(await screen.findByRole('button', { name: '2027' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tahun berikutnya' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '2024' }));
    expect(onChange).toHaveBeenCalledWith(2024);
  });
});
