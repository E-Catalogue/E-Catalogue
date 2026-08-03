import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NumericField } from './Field';

describe('NumericField mode Rupiah', () => {
  it('memformat pemisah ribuan langsung saat mengetik', () => {
    const onChange = vi.fn();
    render(<NumericField label="Nominal" prefix="Rp" value={0} onChange={onChange} />);
    const input = screen.getByLabelText('Nominal');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1000', selectionStart: 4 } });
    expect(input).toHaveValue('1.000');
    expect(onChange).toHaveBeenLastCalledWith(1000);
  });

  it('tidak memberi pemisah ribuan pada angka non-uang', () => {
    render(<NumericField label="Tahun" thousands={false} value={2026} onChange={() => undefined} />);
    const input = screen.getByLabelText('Tahun');
    fireEvent.focus(input);
    expect(input).toHaveValue('2026');
  });
});
