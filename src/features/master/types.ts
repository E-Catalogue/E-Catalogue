export interface Merek {
  id: string;
  name: string;
  isActive: boolean;
  tipeCount?: number;
}

export interface Tipe {
  id: string;
  name: string;
  isActive: boolean;
  merekId?: string;
}

export interface Vendor {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface BranchImage {
  id: string;
  url?: string | null;
}

export interface Branch {
  id: string;
  nama: string;
  code: string;
  lokasi?: string | null;
  longlat?: string | null;
  kontak?: string | null;
  picId?: string | null;
  images?: BranchImage[];
}

export interface Investor {
  id: string;
  name: string;
  code: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  isActive: boolean;
  modalCount?: number;
}

export type ProfitSharingType = 'percentage' | 'fixed';

export interface InvestorModal {
  id: string;
  investorId?: string;
  amount: number;
  profitSharingType: ProfitSharingType;
  profitSharing: number;
  profitSharingDate?: string | null;
  shareStart: string; // "YYYY-MM"
  shareEnd?: string | null; // "YYYY-MM" | null (ongoing)
  isActive: boolean;
  cashAccountId?: string;
  cashTransactionId?: string | null;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}
