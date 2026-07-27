import type { BookPeriod } from './book.types';

/** A final snapshot is meaningful only in one concrete branch, never in Owner consolidation. */
export const findBookSnapshot = (
  periods: BookPeriod[] | undefined,
  period: string,
  isOwner: boolean,
  selectedBranchId: string | null,
) => {
  if (isOwner && !selectedBranchId) return undefined;
  const snapshot = (periods ?? []).find((item) => item.period === period && (!selectedBranchId || item.branchId === selectedBranchId));
  return snapshot?.status === 'CLOSED' ? snapshot : undefined;
};
