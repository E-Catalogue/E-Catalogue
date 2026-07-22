export type TargetStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface TargetSalesLookup {
  id: string;
  branchId: string;
  name: string;
  username: string;
}

/** `/targets/lookups/branches` — cabang yang dapat dipilih user (PRD update_target §1 / lookup §4.11). */
export interface TargetBranchLookup {
  id: string;
  nama: string;
  code: string;
  lokasi?: string | null;
}

export interface SalesTargetAchievement {
  unitActual: number;
  revenueActual: number;
}

export interface SalesTarget {
  id: string;
  salesId: string;
  unitTarget: number;
  revenueTarget: number;
  actualUnit: number | null;
  actualRevenue: number | null;
  sales?: {
    id: string;
    branchId: string;
    name: string;
    username: string;
    isActive: boolean;
  };
  /** Hanya ada saat target dilihat lewat endpoint achievement, atau setelah CLOSED. */
  achievement?: SalesTargetAchievement;
}

export interface TargetAchievement {
  unitActual: number;
  revenueActual: number;
  unitPercent: number;
  revenuePercent: number;
}

export interface BranchTarget {
  id: string;
  branchId: string;
  period: string;
  unitTarget: number;
  revenueTarget: number;
  status: TargetStatus;
  activatedAt: string | null;
  closedAt: string | null;
  actualUnit: number | null;
  actualRevenue: number | null;
  createdAt: string;
  updatedAt: string;
  branch?: { id: string; nama: string; code: string };
  salesTargets?: SalesTarget[];
  /** OPSIONAL — endpoint detail (GET /targets/branches/:id) TIDAK menyertakan field ini (dikonfirmasi
   * dari kode backend: `findById` tidak memanggil `withAchievement`). Ambil lewat endpoint achievement
   * terpisah untuk progres langsung sebuah target. */
  achievement?: TargetAchievement;
}

export interface BranchTargetCreateInput {
  /** WAJIB sejak update_target — cabang dipilih eksplisit, backend TIDAK lagi ambil dari user.branch. */
  branchId: string;
  period: string;
  unitTarget: number;
  revenueTarget: number;
}

/** Update TIDAK boleh mengubah cabang (backend `delete data.branchId`) — hanya period/target. */
export type BranchTargetUpdateInput = Partial<Omit<BranchTargetCreateInput, 'branchId'>>;

export interface SalesTargetReplaceRow {
  salesId: string;
  unitTarget: number;
  revenueTarget: number;
}

export interface SalesTargetReplaceInput {
  sales: SalesTargetReplaceRow[];
}

export interface TargetListParams {
  period?: string;
}

/** Bentuk respons GET /targets/achievement khusus Owner mode "all" (tanpa X-Branch-Id konkret). */
export interface TargetAchievementConsolidated {
  consolidated: {
    unitTarget: number;
    revenueTarget: number;
    unitActual: number;
    revenueActual: number;
  };
  breakdown: BranchTarget[];
}

export const isTargetAchievementConsolidated = (
  d: BranchTarget | TargetAchievementConsolidated | null,
): d is TargetAchievementConsolidated => !!d && 'breakdown' in d;

export const TARGET_STATUS_LABEL: Record<TargetStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Aktif',
  CLOSED: 'Ditutup',
};

export const TARGET_STATUS_COLOR: Record<TargetStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-accent-blue/10 text-accent-blue',
  CLOSED: 'bg-accent-green/10 text-accent-green',
};
