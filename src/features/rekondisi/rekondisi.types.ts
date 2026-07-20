export type RekondisiStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Rekondisi {
  id: string;
  status: RekondisiStatus;
  unitId: string;
  tanggal: string;
  seq: number;
  vendorId: string | null;
  vendor?: { id: string; name: string; code?: string; isActive?: boolean } | null;
  unit?: { id: string; platNomor: string; statusUnit: string };
  keterangan: string | null;
  nominal: number;
  tax: number | null;
  adminFee: number | null;
  additionalFee: number | null;
  total: number;
  invoiceUrl: string | null;
  paidAt: string | null;
  cashAccountId: string | null;
  cashTransactionId: string | null;
  rekondisiDetails?: RekondisiDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface RekondisiDetail {
  id: string;
  rekondisiId: string;
  pengecekanId: string;
  description: string | null;
  nominal: number;
  invoiceUrl?: string | null;
  pengecekan?: { id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface RekondisiFormData {
  vendorId?: string | null;
  keterangan?: string | null;
}

export interface RekondisiDetailFormData {
  pengecekanId: string;
  description?: string;
  nominal: number;
}

export interface RekondisiDoneFormData {
  tax?: number;
  adminFee?: number;
  additionalFee?: number;
  invoice?: File;
}

export interface RekondisiPayFormData {
  cashAccountId: string;
  paidDate: string;
}

export interface RekondisiListParams {
  page?: number;
  limit?: number;
  unitId?: string;
  status?: RekondisiStatus;
}

/**
 * `GET /rekondisis/lookups` — bounded-context lookup untuk dropdown vendor/pengecekan/kas
 * pada form rekondisi. Dipakai agar UI tidak perlu permission `VENDOR_READ`/`PENGECEKAN_READ`
 * hanya untuk isi dropdown (lihat ecatalogue-be/.prd/README.md §9).
 */
export interface RekondisiLookups {
  vendors: { id: string; name: string }[];
  checks: { id: string; name: string; code: string }[];
  cashAccounts: { id: string; branchId: string; name: string; code: string; type: string; defaultPayment: boolean }[];
}

export const REKONDISI_STATUS_LABEL: Record<RekondisiStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  APPROVED: 'Disetujui',
  IN_PROGRESS: 'Dalam Proses',
  COMPLETED: 'Selesai',
};

export const REKONDISI_STATUS_COLOR: Record<RekondisiStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-teal-100 text-teal-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
};
