import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { setSelectedBranch } from '@/app/store/branchSlice';

/**
 * Hook branch-scope untuk modul yang datanya per-cabang (README §8 + PRD
 * `frontend_owner_admin_branch_context_20260721.md`).
 *
 * SUMBER KEBENARAN GLOBAL: `selectedBranchId` disimpan di Redux (`branchSlice`), bukan lagi state
 * lokal per-halaman. Semua halaman/komponen yang memanggil hook ini membaca & menulis pilihan
 * cabang yang SAMA, jadi berpindah cabang di satu tempat langsung konsisten di seluruh app dan
 * bertahan antar reload (localStorage).
 *
 * - OWNER/ADMIN (role global): `selectedBranchId` bisa `null` ("semua cabang", hanya untuk GET).
 *   `branchHeader` hanya terisi kalau cabang konkret dipilih — mutation wajib cabang konkret,
 *   caller menahan submit selama `isOwner && !selectedBranchId`.
 * - Role lain: selalu terikat `user.branch.id`, `setSelectedBranchId` tidak berpengaruh.
 *
 * Saat cabang berubah, seluruh query branch-scoped di-invalidasi supaya tidak ada data/opsi
 * lookup cabang lama yang tertinggal (PRD §6.3).
 */
export const hasAllBranchScope = (roleCode?: string | null) =>
  roleCode === 'OWNER' || roleCode === 'ADMIN';

/** Prefix query-key yang branch-scoped — diinvalidasi saat cabang berubah (PRD §6.3). */
const BRANCH_SCOPED_KEYS = [
  'lookup', 'units', 'unit', 'unit-lookups', 'unit-funding', 'unit-pricing-policies',
  'leads', 'lead', 'lead-orders', 'lead-order', 'lead-payments', 'sale-settlement',
  'test-drives', 'rekondisis', 'rekondisi', 'targets', 'target', 'target-achievement',
  'cash-accounts', 'cash-transactions', 'cash-flow-dashboard', 'operational-expenses',
  'recurring-expenses', 'payroll-base-salaries', 'sales-incentives', 'payroll-runs', 'payroll-run',
  'capital-accounts', 'capital-transactions', 'investor-obligations', 'investor-obligation',
  'book-periods', 'book-period', 'book-ledger', 'book-cash-summary', 'book-profit-summary', 'tax-settings',
  'dashboard',
];

export const useBranchScope = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const selectedBranchId = useAppSelector((s) => s.branch.selectedBranchId);

  // Nama `isOwner` dipertahankan untuk kompatibilitas consumer; artinya "punya akses semua cabang".
  const isOwner = hasAllBranchScope(user?.role?.code);
  const userBranchId = user?.branch?.id ?? null;

  const setSelectedBranchId = useCallback((id: string | null) => {
    dispatch(setSelectedBranch(id));
    // Buang seluruh cache branch-scoped supaya list/lookup/detail cabang lama tidak bocor.
    BRANCH_SCOPED_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  }, [dispatch, queryClient]);

  const branchHeader: Record<string, string> | undefined = isOwner
    ? (selectedBranchId ? { 'X-Branch-Id': selectedBranchId } : undefined)
    : (userBranchId ? { 'X-Branch-Id': userBranchId } : undefined);

  /** Dipakai di query key supaya cache tidak bocor lintas cabang saat selector berpindah. */
  const branchKey = isOwner ? (selectedBranchId ?? 'all') : (userBranchId ?? 'none');

  return { isOwner, userBranchId, selectedBranchId, setSelectedBranchId, branchHeader, branchKey };
};
