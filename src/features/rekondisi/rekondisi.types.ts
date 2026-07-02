export type RekondisiStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Rekondisi {
  id: string;
  status: RekondisiStatus;
  unitId: string;
  tanggal: string;
  seq: number;
  vendorId: string | null;
  vendor?: { id: string; name: string } | null;
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

export const REKONDISI_STATUS_LABEL: Record<RekondisiStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'Dalam Proses',
  COMPLETED: 'Selesai',
};

export const REKONDISI_STATUS_COLOR: Record<RekondisiStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
};
