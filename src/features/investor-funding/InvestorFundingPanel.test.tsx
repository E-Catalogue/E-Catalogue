import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./investorFunding.hooks', () => ({
  useInvestorCapitalAccounts: () => ({ data: [], isLoading: false }),
  useInvestorFundingCashAccounts: () => ({ data: [], isLoading: false }),
  useInvestorFundingMutations: () => ({
    allocate: { isPending: false, mutate: vi.fn() },
    deposit: { isPending: false, mutate: vi.fn() },
  }),
  useInvestorFundingUsages: () => ({
    data: { data: [], summary: { costAmount: 110_000_000, allocatedAmount: 0, outstandingAdvanceAmount: 110_000_000 } },
    isLoading: false,
  }),
}));
vi.mock('@/shared/hooks/useIdempotencyKey', () => ({ useIdempotencyKey: () => ({ key: 'test-key', regenerate: vi.fn() }) }));

import { InvestorFundingPanel } from './InvestorFundingPanel';

const renderPanel = (paymentStatusKnown: boolean) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <InvestorFundingPanel
        resourceType="UNIT_PURCHASE"
        resourceId="unit-1"
        paid={false}
        paymentStatusKnown={paymentStatusKnown}
        canAllocate
      />
    </QueryClientProvider>,
  );
};

describe('InvestorFundingPanel', () => {
  it('tidak menampilkan warning sebelum status pembayaran dari detail unit tersedia', () => {
    renderPanel(false);

    expect(screen.queryByText(/Biaya perusahaan belum tercatat pada kas/i)).not.toBeInTheDocument();
  });

  it('menampilkan warning setelah detail memastikan biaya belum dibayar', () => {
    renderPanel(true);

    expect(screen.getByText(/Biaya perusahaan belum tercatat pada kas/i)).toBeInTheDocument();
  });
});
