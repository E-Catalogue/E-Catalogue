import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { merekApi, tipeApi, vendorApi, branchApi, investorApi, investorModalApi } from './master.api';
import { pengecekanApi } from './simpleMaster.api';
import type { ListParams, Investor, InvestorModal } from './types';

// ---------- Merek ----------
export const useMereks = (params: ListParams) =>
  useQuery({ queryKey: ['mereks', params], queryFn: () => merekApi.list(params) });

export const useMerekMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['mereks'] });
  return {
    create: useMutation({ mutationFn: merekApi.create, onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: { name?: string; isActive?: boolean } }) => merekApi.update(v.id, v.body), onSuccess: inval }),
    remove: useMutation({ mutationFn: merekApi.remove, onSuccess: inval }),
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
    create: useMutation({ mutationFn: (body: { name: string; isActive: boolean }) => tipeApi.create(merekId, body), onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: { name?: string; isActive?: boolean } }) => tipeApi.update(merekId, v.id, v.body), onSuccess: inval }),
    remove: useMutation({ mutationFn: (id: string) => tipeApi.remove(merekId, id), onSuccess: inval }),
  };
};

// ---------- Vendor ----------
export const useVendors = (params: ListParams) =>
  useQuery({ queryKey: ['vendors', params], queryFn: () => vendorApi.list(params) });

export const useVendorMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['vendors'] });
  return {
    create: useMutation({ mutationFn: vendorApi.create, onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: Record<string, unknown> }) => vendorApi.update(v.id, v.body), onSuccess: inval }),
    remove: useMutation({ mutationFn: vendorApi.remove, onSuccess: inval }),
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
    create: useMutation({ mutationFn: branchApi.create, onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: Record<string, unknown> }) => branchApi.update(v.id, v.body), onSuccess: inval }),
    remove: useMutation({ mutationFn: branchApi.remove, onSuccess: inval }),
    uploadImage: useMutation({ mutationFn: (v: { branchId: string; file: File }) => branchApi.uploadImage(v.branchId, v.file), onSuccess: (_d, v) => { inval(); invalOne(v.branchId); } }),
    deleteImage: useMutation({ mutationFn: (v: { branchId: string; imageId: string }) => branchApi.deleteImage(v.branchId, v.imageId), onSuccess: (_d, v) => { inval(); invalOne(v.branchId); } }),
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
    create: useMutation({ mutationFn: (body: Partial<Investor>) => investorApi.create(body), onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<Investor> }) => investorApi.update(v.id, v.body), onSuccess: inval }),
    remove: useMutation({ mutationFn: investorApi.remove, onSuccess: inval }),
  };
};

// ---------- Investor Modal (nested) ----------
export const useInvestorModals = (investorId: string | null, params: ListParams) =>
  useQuery({
    queryKey: ['investor-modals', investorId, params],
    queryFn: () => investorModalApi.list(investorId as string, params),
    enabled: !!investorId,
  });

export const useInvestorModalMutations = (investorId: string) => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['investor-modals', investorId] });
  return {
    create: useMutation({ mutationFn: (body: Partial<InvestorModal>) => investorModalApi.create(investorId, body), onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<InvestorModal> }) => investorModalApi.update(investorId, v.id, v.body), onSuccess: inval }),
    remove: useMutation({ mutationFn: (id: string) => investorModalApi.remove(investorId, id), onSuccess: inval }),
  };
};
