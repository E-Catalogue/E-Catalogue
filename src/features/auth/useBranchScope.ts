import { useState } from 'react';
import { useAppSelector } from '@/app/store';

/**
 * Hook generik untuk modul branch-scoped (per ecatalogue-be/.prd/README.md §8).
 * Dipanggil PER-HALAMAN (local selector pattern) — belum ada context global karena
 * baru modul-modul tertentu (cash-account, cash-transaction, payroll, target, book)
 * yang butuh ini; lihat TASK.md "Gap sistemik" untuk daftar modul yang perlu diadopsi.
 *
 * - Owner/Admin: default `selectedBranchId = null` ("semua cabang") sampai memilih satu.
 *   `branchHeader` hanya terisi kalau Owner sudah memilih cabang konkret — mengosongkan
 *   header ADALAH sinyal "semua cabang" untuk GET. Jangan pernah mengirim `X-Branch-Id: '*'`.
 * - Role lain: selalu terikat ke `user.branch.id` miliknya sendiri, tidak ada selector.
 *
 * Untuk MUTATION, Owner/Admin wajib pilih cabang konkret dulu (backend balas 422
 * `BRANCH_CONTEXT_REQUIRED` kalau tidak) — hook ini hanya menyediakan header,
 * caller bertanggung jawab menahan submit selama `isOwner && !selectedBranchId`.
 */
export const hasAllBranchScope = (roleCode?: string | null) =>
  roleCode === 'OWNER' || roleCode === 'ADMIN';

export const useBranchScope = () => {
  const user = useAppSelector((s) => s.auth.user);
  // Nama ini dipertahankan untuk kompatibilitas consumer; nilainya berarti role global.
  const isOwner = hasAllBranchScope(user?.role?.code);
  const userBranchId = user?.branch?.id ?? null;

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const branchHeader: Record<string, string> | undefined = isOwner
    ? (selectedBranchId ? { 'X-Branch-Id': selectedBranchId } : undefined)
    : (userBranchId ? { 'X-Branch-Id': userBranchId } : undefined);

  /** Dipakai di query key supaya cache tidak bocor lintas cabang saat selector berpindah. */
  const branchKey = isOwner ? (selectedBranchId ?? 'all') : (userBranchId ?? 'none');

  return { isOwner, userBranchId, selectedBranchId, setSelectedBranchId, branchHeader, branchKey };
};
