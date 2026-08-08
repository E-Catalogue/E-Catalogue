import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BackdateReasonHint } from './BackdateReasonHint';
import { backdateReasonRemaining } from './backdateReason';

describe('BackdateReasonHint', () => {
  it('menghitung karakter kurang setelah spasi luar dibuang', () => {
    expect(backdateReasonRemaining(' ab ')).toBe(3);
  });

  it('menampilkan jumlah karakter yang masih kurang', () => {
    render(<BackdateReasonHint value="abc" />);
    expect(screen.getByRole('alert')).toHaveTextContent('kurang 2 karakter');
  });

  it('hilang setelah alasan memenuhi minimum', () => {
    const { container } = render(<BackdateReasonHint value="cukup" />);
    expect(container).toBeEmptyDOMElement();
  });
});
