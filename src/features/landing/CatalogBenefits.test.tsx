import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CatalogBenefits } from './KatalogDetailPage';

describe('CatalogBenefits', () => {
  it('dapat digeser horizontal di mobile dan kembali menjadi baris statis di desktop', () => {
    render(<CatalogBenefits />);

    const benefits = screen.getByTestId('catalog-benefits');
    expect(benefits).toHaveClass('overflow-x-auto', 'flex-nowrap', 'snap-x');
    expect(benefits).toHaveClass('md:overflow-visible', 'md:flex-wrap');
    expect(screen.getByText('Garansi Mesin 1 Bulan').closest('span')).toHaveClass('shrink-0', 'snap-start');
  });
});
