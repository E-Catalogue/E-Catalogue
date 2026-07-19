// Kontrak nyata: GET /dashboard?period=YYYY-MM (ecatalogue-be/src/modules/dashboard).
// Owner tanpa X-Branch-Id (atau '*') -> mode "all": summary+inventory konsolidasi + breakdown per cabang.
// Owner dengan X-Branch-Id, atau non-Owner: mode "single": summary+inventory+charts satu cabang.

export interface DashboardBranchRef {
  id: string;
  nama: string;
  code: string;
}

/**
 * Field uang backend sudah diserialisasi jadi number biasa (lihat utils/response.js `serialize`),
 * bukan string — jangan format ulang selain lewat formatCurrency untuk display.
 */
export interface DashboardSummary {
  unitSold: number;
  revenue: number;
  hpp: number;
  grossProfit: number;
  expense: number;
  operationalExpense: number;
  payrollExpense: number;
  reconditioningCost: number;
  netProfit: number;
  investorProfit: number;
  fixedReturnExpense: number;
  taxProvision: number;
  salesIncentiveAccrued: number;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  totalLeads: number;
  totalTestDrives: number;
  conversionRate: number;
  targetUnit: number;
  targetRevenue: number;
  /** Hanya ada di summary single-branch; summary konsolidasi Owner tidak mengirim field ini. */
  targetStatus?: string | null;
}

export interface DashboardInventory {
  totalStock: number;
  inventoryStock: number;
  readyStock: number;
  holdStock: number;
  soldStock: number;
  totalValue: number;
}

export interface DashboardMonthlySale {
  /** 1-12. Selalu 12 titik, termasuk bulan bernilai nol — jangan difilter. */
  month: number;
  unit: number;
  revenue: number;
}

export interface DashboardCharts {
  monthlySales: DashboardMonthlySale[];
}

/** Satu baris breakdown per cabang pada respons Owner "all". */
export interface DashboardBranchBreakdown {
  branch: DashboardBranchRef;
  summary: DashboardSummary;
  inventory: DashboardInventory;
  charts: DashboardCharts;
}

export interface DashboardOverviewSingle {
  period: string;
  branch: DashboardBranchRef;
  summary: DashboardSummary;
  inventory: DashboardInventory;
  charts: DashboardCharts;
}

export interface DashboardOverviewConsolidated {
  period: string;
  /** Konsolidasi seluruh cabang; cashflow di sini mengecualikan transfer antar-cabang. */
  summary: DashboardSummary;
  inventory: DashboardInventory;
  breakdown: DashboardBranchBreakdown[];
}

export type DashboardOverview = DashboardOverviewSingle | DashboardOverviewConsolidated;

export const isDashboardConsolidated = (
  data: DashboardOverview,
): data is DashboardOverviewConsolidated => 'breakdown' in data;
