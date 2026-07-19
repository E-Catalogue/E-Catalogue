export type TargetStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface TargetAchievement {
  unitActual: number;
  revenueActual: number;
  unitPercent: number;
  revenuePercent: number;
}

export interface SalesTargetAchievement {
  unitActual: number;
  revenueActual: number;
}

export interface TargetSalesLookup {
  id: string;
  branchId: string;
  name: string;
  username: string;
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
  /** Hanya ada saat target dilihat lewat endpoint achievement atau setelah CLOSED. */
  achievement?: SalesTargetAchievement;
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
  /** OPTIONAL — endpoint detail (GET /targets/branches/:id) TIDAK menyertakan field ini. */
  achievement?: TargetAchievement;
}

export interface BranchTargetCreateInput {
  period: string;
  unitTarget: number;
  revenueTarget: number;
}

export type BranchTargetUpdateInput = Partial<BranchTargetCreateInput>;

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

/** Bentuk respons /targets/achievement khusus Owner tanpa branch header (mode "all"). */
export interface TargetBranchesOwnerAll {
  consolidated: {
    unitTarget: number;
    revenueTarget: number;
    unitActual: number;
    revenueActual: number;
  };
  breakdown: BranchTarget[];
}

export const TARGET_STATUS_LABEL: Record<TargetStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Aktif',
  CLOSED: 'Ditutup',
};

export const TARGET_STATUS_COLOR: Record<TargetStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-green-100 text-green-700',
};
