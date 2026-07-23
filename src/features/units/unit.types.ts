export type StatusUnit = 'INVENTORY' | 'READY_STOCK' | 'HOLD' | 'SOLD';
export type Transmisi = 'MANUAL' | 'AUTOMATIC';

export type FundingSource = 'COMPANY_OWNED' | 'INVESTOR';
export type FundingScheme = 'FIXED_MONTHLY' | 'PROFIT_SHARE';
export type FinalCyclePolicy = 'FULL' | 'NONE' | 'PRORATA';
export type FundingStatus = 'DRAFT' | 'ACTIVE' | 'RELEASED' | 'ENDED';

export interface FundingAgreement {
  id: string;
  unitId: string;
  fundingSource: FundingSource;
  scheme: FundingScheme | null;
  investorId: string | null;
  capitalAccountId: string | null;
  originBranchId: string;
  branchId: string;
  status: FundingStatus;
  principalAmount: number;
  fixedReturnRate: number | null;
  profitShareRate: number | null;
  finalCyclePolicy: FinalCyclePolicy | null;
  effectiveDate: string | null;
  nextDueDate: string | null;
  pricingLockedAt?: string | null;
  endedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  investor?: { id: string; name: string; code: string; scheme?: FundingScheme | null; defaultRate?: number | null } | null;
  capitalAccount?: { id: string; investorId: string; branchId: string; availableBalance: number; allocatedBalance: number } | null;
  branch?: { id: string; nama: string; code: string } | null;
}

/** Payload dikirim di `POST /units` — lihat unit/funding/funding.validation.js `fundingInputSchema`. */
export interface UnitFundingInput {
  fundingSource: FundingSource;
  /** Wajib bila fundingSource = INVESTOR; jangan dikirim untuk COMPANY_OWNED. */
  investorId?: string;
  /** Wajib (secara business rule) bila skema investor terpilih FIXED_MONTHLY. */
  finalCyclePolicy?: FinalCyclePolicy;
}

export interface Unit {
  id: string;
  /** Nama bisnis/display name Unit yang ditentukan pengguna (mis. "Avanza G AT Putih 2023"). */
  name: string;
  branchId: string;
  statusUnit: StatusUnit;
  isActive: boolean;
  merekId: string;
  tipeId: string;
  platNomor: string;
  tahun: number;
  warna: string;
  transmisi: Transmisi;
  noRangka: string;
  noMesin: string;
  kilometer: number;
  tanggalPajak: string;
  purchaseCost: number;
  tanggalPembelian: string;
  cashAccountId?: string;
  purchaseCashTransactionId?: string | null;
  initialReconditioningCost?: number | null;
  additionalReconditioningCost?: number | null;
  pricingCostBasis?: number | null;
  totalActualUnitCost?: number | null;
  initialReconditioningWaived?: boolean;
  targetMarkupPercentSnapshot?: number | null;
  otrMarkupPercentSnapshot?: number | null;
  targetPrice?: number | null;
  otrPrice?: number | null;
  pricingFinalizedAt?: string | null;
  isNew?: boolean;
  statusKatalog?: string | null;
  variant?: string | null;
  bahanBakar?: string | null;
  deskripsi?: string | null;
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations (optional/included)
  branch?: { id: string; nama: string; code: string; lokasi?: string | null };
  merek?: { id: string; name: string };
  tipe?: { id: string; name: string; merekId: string };
  fundingAgreement?: FundingAgreement | null;
  unitImages?: Array<{
    id: string;
    filename: string;
    originalName: string;
    extension: string;
    sequence?: number;
    isMain?: boolean;
    unitId: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  unitKelengkapans?: Array<{
    id: string;
    perlengkapanId: string;
    perlengkapan?: { id: string; name: string; code: string };
  }>;
  unitDokumens?: Array<{
    id: string;
    dokumenId: string;
    dokumen?: { id: string; name: string; code: string };
  }>;
}

export interface UnitFormData {
  /** Nama Unit (wajib pada create; opsional pada update tapi tetap divalidasi bila dikirim). */
  name: string;
  merekId: string;
  tipeId: string;
  platNomor: string;
  tahun: number;
  warna: string;
  transmisi: Transmisi;
  noRangka: string;
  noMesin: string;
  kilometer: number;
  tanggalPajak: string; // ISO String
  purchaseCost: number;
  tanggalPembelian: string; // ISO String
  cashAccountId?: string;
  /** Wajib pada create (`POST /units`); tidak dikirim/diterima pada update. */
  funding?: UnitFundingInput;
  kelengkapans: string[];
  dokumens: string[];
}

export interface UnitStatusUpdate {
  statusUnit: StatusUnit;
}

export interface MasterKelengkapan {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface MasterDokumen {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface UnitImageReorderItem {
  id: string;
  sequence: number;
}

// ── Lookups (`GET /units/lookups`) ──────────────────────────────────────────

export interface UnitLookupTipe {
  id: string;
  merekId: string;
  name: string;
}

export interface UnitLookupMerek {
  id: string;
  name: string;
  tipes: UnitLookupTipe[];
}

export interface UnitLookupCashAccount {
  id: string;
  branchId: string;
  name: string;
  code: string;
  type: string;
  defaultPayment: boolean;
}

export interface UnitLookupInvestorCapitalAccount {
  id: string;
  branchId: string;
  availableBalance: number;
  allocatedBalance: number;
}

export interface UnitLookupInvestor {
  id: string;
  name: string;
  code: string;
  scheme: FundingScheme;
  defaultRate: number;
  capitalAccounts: UnitLookupInvestorCapitalAccount[];
}

export interface UnitLookupPricingPolicy {
  id: string;
  branchId: string;
  targetMarkupPercent: number;
  otrMarkupPercent: number;
  effectiveAt: string;
}

export interface UnitLookups {
  brands: UnitLookupMerek[];
  documents: MasterDokumen[];
  equipment: MasterKelengkapan[];
  cashAccounts: UnitLookupCashAccount[];
  investors: UnitLookupInvestor[];
  pricingPolicies: UnitLookupPricingPolicy[];
  finalCyclePolicies: FinalCyclePolicy[];
}

// ── Pricing policy (`GET/PUT /units/pricing-policy`) ────────────────────────

export interface PricingPolicy {
  id: string;
  branchId: string;
  targetMarkupPercent: number;
  otrMarkupPercent: number;
  effectiveAt: string;
  endedAt?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  branch?: { id: string; nama: string; code: string };
}

export interface PricingPolicyUpdatePayload {
  targetMarkupPercent: number;
  otrMarkupPercent: number;
  /** ISO date; optional — default ke waktu sekarang bila tidak dikirim. */
  effectiveAt?: string;
}

// ── Funding (`GET/PATCH /units/:id/funding`) ────────────────────────────────

export interface UnitFundingUpdatePayload {
  finalCyclePolicy: FinalCyclePolicy;
}

// ── Finalisasi harga awal (`POST /units/:id/finalize-initial-pricing`) ─────

export interface FinalizeInitialPricingPayload {
  /** Wajib true hanya bila unit belum pernah punya rekondisi pertama (seq 1). */
  confirmNoInitialReconditioning?: boolean;
}

// ── Transfer cabang (`POST /units/:id/transfer-branch`) ────────────────────

export interface UnitTransferBranchPayload {
  targetBranchId: string;
  reason: string;
}

export interface UnitBranchMovement {
  id: string;
  unitId: string;
  fromBranchId: string;
  toBranchId: string;
  hppSaatTransfer: number;
  reason: string;
  movedAt: string;
  movedBy?: { id: string; name: string };
  fromBranch?: { id: string; nama: string; code: string };
  toBranch?: { id: string; nama: string; code: string };
}

export interface UnitTransferBranchResult {
  unit: Unit;
  movement: UnitBranchMovement;
}
