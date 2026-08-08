import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HistoricalModeBadge } from './HistoricalModeBadge';

describe('HistoricalModeBadge', () => {
  it('menampilkan label mode histori tanpa underscore', () => {
    render(<HistoricalModeBadge mode="REFERENCE_ONLY" />);
    expect(screen.getByText('REFERENCE ONLY')).toBeInTheDocument();
  });

  it('tidak merender badge untuk transaksi normal', () => {
    const { container } = render(<HistoricalModeBadge mode={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
