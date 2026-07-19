import { useState } from 'react';
import { useAppSelector } from '@/app/store';

/**
 * Hook generik untuk modul branch-scoped (per README §8).
 * Dipanggil PER-HALAMAN (local selector pattern) — bukan lewat context global.
 *
 * - Owner: default `selectedBranchId = null` (artinya "semua cabang" sampai dia memilih satu).
 *   `branchHeader` hanya terisi kalau Owner sudah memilih cabang — mengosongkan header
 *   ADALAH sinyal "semua cabang" untuk request GET. Jangan pernah mengirim `X-Branch-Id: '*'`.
 * - Non-Owner: selalu terikat ke `user.branch.id` miliknya sendiri.
 *
 * Catatan: hook ini hanya menentukan header untuk GET. Untuk mutation, caller wajib
 * memastikan sendiri `selectedBranchId` terisi saat Owner (hook ini tidak memutuskan itu).
 */
export const useBranchScope = () => {
  const user = useAppSelector((s) => s.auth.user);
  const isOwner = user?.role?.code === 'OWNER';
  const userBranchId = user?.branch?.id ?? null;

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const branchHeader: Record<string, string> | undefined = isOwner
    ? (selectedBranchId ? { 'X-Branch-Id': selectedBranchId } : undefined)
    : (userBranchId ? { 'X-Branch-Id': userBranchId } : undefined);

  const branchKey = isOwner ? (selectedBranchId ?? 'all') : (userBranchId ?? 'none');

  return {
    isOwner,
    userBranchId,
    selectedBranchId,
    setSelectedBranchId,
    branchHeader,
    branchKey,
  };
};
