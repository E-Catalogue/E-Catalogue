import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unitApi } from './unit.api';
import type {
  UnitFormData,
  UnitListParams,
  UnitStatusUpdate,
  UnitFundingUpdatePayload,
  UnitFundingCorrectionPayload,
  FinalizeInitialPricingPayload,
  PricingPolicyUpdatePayload,
  UnitTransferBranchPayload,
} from './unit.types';
import { rekondisiApi } from '@/features/rekondisi/rekondisi.api';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';

type BranchHeaders = Record<string, string> | undefined;

export function useUnits(params?: UnitListParams) {
  return useQuery({
    queryKey: ['units', params],
    queryFn: () => unitApi.list(params),
  });
}

export function useUnit(id?: string) {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: () => unitApi.get(id!),
    enabled: !!id,
  });
}

/** `GET /units/lookups` — form context (merek/tipe, dokumen, kelengkapan, kas, investor, pricing policy). */
export function useUnitLookups(open: boolean, branchKey?: string, headers?: BranchHeaders) {
  return useQuery({
    queryKey: ['unit-lookups', branchKey ?? 'default'],
    queryFn: () => unitApi.getLookups(headers),
    enabled: open,
    staleTime: 60_000,
  });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UnitFormData) => unitApi.create(data),
    onSuccess: () => {
      store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Tindakan berhasil' }));
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['cms', 'catalog'] });
      qc.invalidateQueries({ queryKey: ['public', 'catalog'] });
    },
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UnitFormData> & { funding?: UnitFundingUpdatePayload } }) => unitApi.update(id, data),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Unit berhasil diperbarui' }));
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['unit', id] });
      qc.invalidateQueries({ queryKey: ['unit-funding', id] });
      qc.invalidateQueries({ queryKey: ['cms', 'catalog'] });
      qc.invalidateQueries({ queryKey: ['public', 'catalog'] });
    },
  });
}

export function useUpdateUnitStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitStatusUpdate }) => unitApi.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Status unit berhasil diperbarui' }));
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['unit', id] });
      qc.invalidateQueries({ queryKey: ['cms', 'catalog'] });
      qc.invalidateQueries({ queryKey: ['public', 'catalog'] });
      qc.invalidateQueries({ queryKey: ['lookup', 'cms-homepage', 'featured'] });
    },
  });
}

export function useArchiveUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => unitApi.archive(id, reason),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Unit Diarsipkan', message: 'Unit telah berhasil diarsipkan dari inventori.' }));
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['unit', id] });
      qc.invalidateQueries({ queryKey: ['cms', 'catalog'] });
      qc.invalidateQueries({ queryKey: ['public', 'catalog'] });
    },
  });
}

export function useCancelPurchaseUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => unitApi.cancelPurchase(id, reason),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Pembelian Dibatalkan', message: 'Transaksi pembelian unit dan alokasi modal investor telah dibalik secara akuntabel.' }));
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['unit', id] });
      qc.invalidateQueries({ queryKey: ['investor-capital-accounts'] });
      qc.invalidateQueries({ queryKey: ['investor-funding-usages'] });
      qc.invalidateQueries({ queryKey: ['cash-transactions'] });
      qc.invalidateQueries({ queryKey: ['cms', 'catalog'] });
      qc.invalidateQueries({ queryKey: ['public', 'catalog'] });
    },
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => unitApi.delete(id, reason),
    onSuccess: () => {
      store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Unit berhasil diarsipkan' }));
      qc.invalidateQueries({ queryKey: ['units'] });
    },
  });
}

export function useRekondisiStatusCheck(id?: string) {
  return useQuery({
    queryKey: ['unit-rekondisi-check', id],
    queryFn: () => unitApi.rekondisiStatusCheck(id!),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useCreateRekondisi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, keterangan }: { id: string; keterangan?: string }) => {
      const created = await unitApi.createRekondisi(id);
      // Endpoint create hanya menerima unitId — catatan awal (bila diisi) disimpan lewat update terpisah.
      if (keterangan?.trim()) {
        await rekondisiApi.update(created.data.id, { keterangan: keterangan.trim() });
      }
      return created;
    },
    onSuccess: () => {
      store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Berhasil', message: 'Rekondisi baru dibuat' }));
      qc.invalidateQueries({ queryKey: ['rekondisis'] });
    },
  });
}

export function useUnitImageMutations(unitId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['unit', unitId] });
    qc.invalidateQueries({ queryKey: ['units'] });
  };
  return {
    upload: useMutation({
      mutationFn: (v: { file: File; sequence?: number; isMain?: boolean }) => unitApi.uploadImage(unitId, v.file, { sequence: v.sequence, isMain: v.isMain }),
      onSuccess: () => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Foto unit diunggah', variant: 'success' }));
        invalidate();
      },
    }),
    // Unggah semua foto sekaligus dalam SATU request (array), foto utama via mainIndex.
    uploadMany: useMutation({
      mutationFn: ({ files, mainIndex }: { files: File[]; mainIndex: number | null }) => unitApi.uploadImages(unitId, files, mainIndex),
      onSuccess: (_, { files }) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: `${files.length} foto unit diunggah`, variant: 'success' }));
        invalidate();
      },
    }),
    remove: useMutation({
      mutationFn: (imageId: string) => unitApi.deleteImage(unitId, imageId),
      onSuccess: () => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Foto unit dihapus', variant: 'success' }));
        invalidate();
      },
    }),
    reorder: useMutation({
      mutationFn: (images: { id: string; sequence: number }[]) => unitApi.reorderImages(unitId, images),
      onSuccess: () => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Urutan foto unit diperbarui', variant: 'success' }));
        invalidate();
      },
    }),
    setMain: useMutation({
      mutationFn: (imageId: string) => unitApi.setMainImage(unitId, imageId),
      onSuccess: () => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Foto utama unit diperbarui', variant: 'success' }));
        invalidate();
      },
    }),
  };
}

export function useMasterKelengkapan() {
  return useQuery({
    queryKey: ['master-kelengkapans'],
    queryFn: () => unitApi.getMasterKelengkapans(),
  });
}

export function useMasterDokumen() {
  return useQuery({
    queryKey: ['master-dokumens'],
    queryFn: () => unitApi.getMasterDokumens(),
  });
}

// ── Pendanaan (funding) ────────────────────────────────────────────────────

export function useUnitFunding(id?: string) {
  return useQuery({
    queryKey: ['unit-funding', id],
    queryFn: () => unitApi.getFunding(id!),
    enabled: !!id,
  });
}

export function useUpdateUnitFunding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, headers }: { id: string; data: UnitFundingUpdatePayload; headers?: BranchHeaders }) =>
      unitApi.updateFunding(id, data, headers),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Berhasil', message: 'Aturan pendanaan unit diperbarui' }));
      qc.invalidateQueries({ queryKey: ['unit-funding', id] });
      qc.invalidateQueries({ queryKey: ['unit', id] });
    },
  });
}

export function useCorrectUnitFunding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, headers }: { id: string; data: UnitFundingCorrectionPayload; headers?: BranchHeaders }) =>
      unitApi.correctFunding(id, data, headers),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Berhasil', message: 'Koreksi investor dan pendanaan berhasil diproses' }));
      qc.invalidateQueries({ queryKey: ['unit-funding', id] });
      qc.invalidateQueries({ queryKey: ['unit', id] });
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['investor-capital'] });
      qc.invalidateQueries({ queryKey: ['investor-obligations'] });
    },
  });
}

export function useFinalizeInitialPricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, headers }: { id: string; data: FinalizeInitialPricingPayload; headers?: BranchHeaders }) =>
      unitApi.finalizeInitialPricing(id, data, headers),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Berhasil', message: 'Harga awal unit berhasil difinalisasi' }));
      qc.invalidateQueries({ queryKey: ['unit', id] });
      qc.invalidateQueries({ queryKey: ['unit-pricing-preview', id] });
      qc.invalidateQueries({ queryKey: ['unit-funding', id] });
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['cms', 'catalog'] });
      qc.invalidateQueries({ queryKey: ['public', 'catalog'] });
      qc.invalidateQueries({ queryKey: ['lookup', 'cms-homepage', 'featured'] });
    },
  });
}

export function usePricingPreview(id?: string, data: Partial<FinalizeInitialPricingPayload> = {}, headers?: BranchHeaders) {
  return useQuery({
    queryKey: ['unit-pricing-preview', id, data, headers?.['X-Branch-Id']],
    queryFn: () => unitApi.pricingPreview(id!, data, headers),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
}

export function useInventoryFilterLookups() {
  return useQuery({
    queryKey: ['unit-lookups', 'inventory-filters'],
    queryFn: () => unitApi.getInventoryFilters(),
    staleTime: 60_000,
  });
}

export function useReopenPricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, headers }: { id: string; data: { reason: string }; headers?: BranchHeaders }) => unitApi.reopenPricing(id, data, headers),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Harga dibuka kembali', message: 'Unit kembali ke Inventory dan perlu difinalisasi ulang.' }));
      qc.invalidateQueries({ queryKey: ['unit', id] });
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['cms', 'catalog'] });
      qc.invalidateQueries({ queryKey: ['public', 'catalog'] });
    },
  });
}

// ── Pricing policy ──────────────────────────────────────────────────────────

export function usePricingPolicies(headers?: BranchHeaders, branchKey?: string) {
  return useQuery({
    queryKey: ['unit-pricing-policies', branchKey ?? 'default'],
    queryFn: () => unitApi.getPricingPolicies(headers),
  });
}

export function useUpdatePricingPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, headers }: { data: PricingPolicyUpdatePayload; headers?: BranchHeaders }) =>
      unitApi.updatePricingPolicy(data, headers),
    onSuccess: () => {
      store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Berhasil', message: 'Pricing policy berhasil diperbarui' }));
      qc.invalidateQueries({ queryKey: ['unit-pricing-policies'] });
      qc.invalidateQueries({ queryKey: ['unit-lookups'] });
    },
  });
}

// ── Transfer cabang ─────────────────────────────────────────────────────────

export function useTransferUnitBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, headers }: { id: string; data: UnitTransferBranchPayload; headers?: BranchHeaders }) =>
      unitApi.transferBranch(id, data, headers),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Berhasil', message: 'Unit berhasil dipindahkan ke cabang tujuan' }));
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['unit', id] });
      qc.invalidateQueries({ queryKey: ['unit-funding', id] });
    },
  });
}
