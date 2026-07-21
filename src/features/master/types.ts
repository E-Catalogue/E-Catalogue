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
  /** `.prd/update_vendor_code_20260720_203949.md` — wajib pada create, unik global, bukan auto-generate. */
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorCreateInput {
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive?: boolean;
}

export type VendorUpdateInput = Partial<VendorCreateInput>;

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

// Kontrak: ecatalogue-be/.prd/create_investor_20260717_090122.md
// + ecatalogue-be/src/modules/investor/{investor.validation.js,capital/*} (kode backend menang atas prosa PRD).

export type InvestorScheme = 'FIXED_MONTHLY' | 'PROFIT_SHARE';

export const INVESTOR_SCHEME_LABEL: Record<InvestorScheme, string> = {
  FIXED_MONTHLY: 'Fixed Monthly',
  PROFIT_SHARE: 'Profit Share',
};

export interface Investor {
  id: string;
  name: string;
  code: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  /** Wajib diisi saat create (Joi `.required()`); opsional saat update. */
  scheme: InvestorScheme;
  /** Persentase, > 0 dan <= 100 (Joi `positive().max(100)`). Wajib saat create. */
  defaultRate: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  modalCount?: number;
}

// ---- Capital account & transaction (menggantikan InvestorModal lama — endpoint /modals sudah 410) ----

export interface CapitalAccount {
  id: string;
  investorId: string;
  branchId: string;
  availableBalance: number;
  allocatedBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branch: { id: string; nama: string; code: string };
  investor: { id: string; name: string; code: string; scheme: InvestorScheme; defaultRate: number };
}

/** Bentuk response `GET /investors/:id/capital-accounts` untuk Owner tanpa `X-Branch-Id` (semua cabang). */
export interface CapitalAccountsConsolidated {
  consolidated: { availableBalance: number; allocatedBalance: number; totalCapital: number };
  breakdown: CapitalAccount[];
}

export type CapitalTransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'ALLOCATION'
  | 'RELEASE'
  | 'BRANCH_TRANSFER_IN'
  | 'BRANCH_TRANSFER_OUT'
  | 'REVERSAL';

export type CapitalPostingStatus = 'PENDING' | 'POSTED' | 'REVERSED';

export const CAPITAL_TX_TYPE_LABEL: Record<CapitalTransactionType, string> = {
  DEPOSIT: 'Setoran',
  WITHDRAWAL: 'Penarikan',
  ALLOCATION: 'Alokasi',
  RELEASE: 'Pelepasan',
  BRANCH_TRANSFER_IN: 'Transfer Masuk',
  BRANCH_TRANSFER_OUT: 'Transfer Keluar',
  REVERSAL: 'Reversal',
};

export const CAPITAL_POSTING_STATUS_LABEL: Record<CapitalPostingStatus, string> = {
  PENDING: 'Pending',
  POSTED: 'Terposting',
  REVERSED: 'Dibalik',
};

/** Response transaksi modal — immutable ledger, tidak ada edit/delete (README PRD §"panduan tampilan"). */
export interface CapitalTransaction {
  id: string;
  capitalAccountId: string;
  type: CapitalTransactionType;
  amount: number;
  businessDate: string;
  description: string | null;
  fundingAgreementId: string | null;
  cashTransactionId: string | null;
  postingStatus: CapitalPostingStatus;
  idempotencyKey: string;
  reversalOfId: string | null;
  createdAt: string;
  capitalAccount: { id: string; investorId: string; branchId: string };
}

/** Body `POST /investors/:id/capital/deposits` dan `/capital/withdrawals` (capital.validation.js). */
export interface CapitalMutationPayload {
  cashAccountId: string;
  amount: number;
  /** ISO date `YYYY-MM-DD`. */
  transactionDate: string;
  description?: string;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}
