import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { merekApi, tipeApi, vendorApi, branchApi, investorApi, capitalApi } from './master.api';
import { pengecekanApi } from './simpleMaster.api';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import type { ListParams, Investor, CapitalMutationPayload } from './types';

const toast = (message: string) => store.dispatch(showToast({ title: 'Berhasil', message, variant: 'success' }));

/** Header opsional `{ 'X-Branch-Id': branchId }` — lihat src/features/auth/useBranchScope.ts. */
type BranchHeaders = Record<string, string> | undefined;

// ---------- Merek ----------
export const useMereks = (params: ListParams) =>
  useQuery({ queryKey: ['mereks', params], queryFn: () => merekApi.list(params) });

export const useMerekMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['mereks'] });
  return {
    create: useMutation({ mutationFn: merekApi.create, onSuccess: () => { toast('Merek ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: { name?: string; isActive?: boolean } }) => merekApi.update(v.id, v.body), onSuccess: () => { toast('Merek diperbarui'); inval(); } }),
    remove: useMutation({ mutationFn: merekApi.remove, onSuccess: () => { toast('Merek dihapus'); inval(); } }),
  };
};

// ---------- Tipe ----------
export const useTipes = (merekId: string | null, params: ListParams) =>
  useQuery({
    queryKey: ['tipes', merekId, params],
    queryFn: () => tipeApi.list(merekId as string, params),
    enabled: !!merekId,
  });

export const useTipeMutations = (merekId: string) => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['tipes', merekId] });
  return {
    create: useMutation({ mutationFn: (body: { name: string; isActive: boolean }) => tipeApi.create(merekId, body), onSuccess: () => { toast('Tipe ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: { name?: string; isActive?: boolean } }) => tipeApi.update(merekId, v.id, v.body), onSuccess: () => { toast('Tipe diperbarui'); inval(); } }),
    remove: useMutation({ mutationFn: (id: string) => tipeApi.remove(merekId, id), onSuccess: () => { toast('Tipe dihapus'); inval(); } }),
  };
};

// ---------- Vendor ----------
export const useVendors = (params: ListParams) =>
  useQuery({ queryKey: ['vendors', params], queryFn: () => vendorApi.list(params) });

export const useVendorMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['vendors'] });
  return {
    create: useMutation({ mutationFn: vendorApi.create, onSuccess: () => { toast('Vendor ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: Record<string, unknown> }) => vendorApi.update(v.id, v.body), onSuccess: () => { toast('Vendor diperbarui'); inval(); } }),
    remove: useMutation({ mutationFn: vendorApi.remove, onSuccess: () => { toast('Vendor dihapus'); inval(); } }),
  };
};

// ---------- Branch ----------
export const useBranches = (params: ListParams) =>
  useQuery({ queryKey: ['branches', params], queryFn: () => branchApi.list(params) });

export const useBranch = (id: string | null) =>
  useQuery({ queryKey: ['branch', id], queryFn: () => branchApi.get(id as string), enabled: !!id });

export const useBranchMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['branches'] });
  const invalOne = (id: string) => qc.invalidateQueries({ queryKey: ['branch', id] });
  return {
    create: useMutation({ mutationFn: branchApi.create, onSuccess: () => { toast('Cabang ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: Record<string, unknown> }) => branchApi.update(v.id, v.body), onSuccess: () => { toast('Cabang diperbarui'); inval(); } }),
    remove: useMutation({ mutationFn: branchApi.remove, onSuccess: () => { toast('Cabang dihapus'); inval(); } }),
    uploadImage: useMutation({ mutationFn: (v: { branchId: string; file: File }) => branchApi.uploadImage(v.branchId, v.file), onSuccess: (_d, v) => { toast('Foto cabang diunggah'); inval(); invalOne(v.branchId); } }),
    deleteImage: useMutation({ mutationFn: (v: { branchId: string; imageId: string }) => branchApi.deleteImage(v.branchId, v.imageId), onSuccess: (_d, v) => { toast('Foto cabang dihapus'); inval(); invalOne(v.branchId); } }),
  };
};

// ---------- Pengecekan (dropdown for rekondisi) ----------
export const usePengecekan = (params: ListParams) =>
  useQuery({ queryKey: ['pengecekans', params], queryFn: () => pengecekanApi.list(params) });

// ---------- Investor ----------
export const useInvestors = (params: ListParams) =>
  useQuery({ queryKey: ['investors', params], queryFn: () => investorApi.list(params) });

export const useInvestorMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['investors'] });
  return {
    create: useMutation({ mutationFn: (body: Partial<Investor>) => investorApi.create(body), onSuccess: () => { toast('Investor ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<Investor> }) => investorApi.update(v.id, v.body), onSuccess: () => { toast('Investor diperbarui'); inval(); } }),
    remove: useMutation({ mutationFn: investorApi.remove, onSuccess: () => { toast('Investor dihapus'); inval(); } }),
  };
};

// ---------- Investor Capital (nested) ----------
// Query key menyertakan `branchKey` (README §8) supaya cache Cabang A tidak bocor ke Cabang B
// saat Owner memindahkan selector — lihat pola sama di investor-obligation.hooks.ts.
export const useCapitalAccounts = (branchKey: string, investorId: string | null, headers: BranchHeaders) =>
  useQuery({
    queryKey: ['capital-accounts', branchKey, investorId],
    queryFn: () => capitalApi.accounts(investorId as string, headers),
    enabled: !!investorId,
  });

export const useCapitalTransactions = (branchKey: string, investorId: string | null, params: ListParams, headers: BranchHeaders) =>
  useQuery({
    queryKey: ['capital-transactions', branchKey, investorId, params],
    queryFn: () => capitalApi.transactions(investorId as string, params, headers),
    enabled: !!investorId,
  });

/**
 * Deposit/withdrawal modal investor — mutation finansial (README §14: Idempotency-Key wajib,
 * README §16: response adalah CapitalTransaction, BUKAN saldo akun terbaru — invalidate
 * capital-accounts, capital-transactions, DAN cash-accounts/cash-transactions/cash-flow-dashboard).
 */
export const useCapitalMutations = (branchKey: string, investorId: string) => {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['capital-accounts', branchKey, investorId] });
    qc.invalidateQueries({ queryKey: ['capital-transactions', branchKey, investorId] });
    qc.invalidateQueries({ queryKey: ['cash-accounts'] });
    qc.invalidateQueries({ queryKey: ['cash-transactions'] });
    qc.invalidateQueries({ queryKey: ['cash-flow-dashboard'] });
  };
  return {
    deposit: useMutation({
      mutationFn: (v: { body: CapitalMutationPayload; headers: BranchHeaders; idempotencyKey: string }) =>
        capitalApi.deposit(investorId, v.body, v.headers, v.idempotencyKey),
      onSuccess: () => { toast('Setoran modal investor berhasil diposting'); inval(); },
    }),
    withdraw: useMutation({
      mutationFn: (v: { body: CapitalMutationPayload; headers: BranchHeaders; idempotencyKey: string }) =>
        capitalApi.withdraw(investorId, v.body, v.headers, v.idempotencyKey),
      onSuccess: () => { toast('Penarikan modal investor berhasil diposting'); inval(); },
    }),
  };
};
