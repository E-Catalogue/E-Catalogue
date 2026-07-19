export type DashboardPeriodType = 'yearly' | 'monthly' | 'yearToDate';

export interface DashboardOverview {
  period: {
    tipePeriode: DashboardPeriodType;
    period: string;
    label: string;
    previousLabel: string;
    dateFrom: string;
    dateTo: string;
  };
  summary: {
    unitSold: number;
    revenue: number;
    hpp: number;
    grossProfit: number;
    expense: number;
    netProfit: number;
    margin: number;
    targetUnit: number;
    targetRevenue: number;
    cashIn: number;
    cashOut: number;
    netCashFlow: number;
    availableCash: number;
    totalLeads: number;
    totalTestDrives: number;
    conversionRate: number;
    trend: {
      unitSold: number;
      revenue: number;
      netProfit: number;
      expense: number;
      cash: number;
      leads: number;
    };
  };
  inventory: {
    totalStock: number;
    readyStock: number;
    holdStock: number;
    inventoryStock: number;
    totalValue: number;
    averageAge: number;
    healthyCount: number;
    warningCount: number;
    criticalCount: number;
  };
  charts: {
    monthlySales: DashboardMonthlySale[];
    topSelling: DashboardTopSelling[];
    salesPerformance: DashboardSalesPerformance[];
    leadSources: DashboardLeadSource[];
    agingStock: DashboardAgingStock[];
  };
}

export interface DashboardMonthlySale {
  month: string;
  unit: number;
  omzet: number;
}

export interface DashboardTopSelling {
  rank: number;
  merek: string;
  tipe: string;
  count: number;
  revenue: number;
}

export interface DashboardSalesPerformance {
  id: string;
  name: string;
  initial: string;
  unit: number;
  revenue: number;
}

export interface DashboardLeadSource {
  source: string;
  count: number;
  color: string;
}

export interface DashboardAgingStock {
  id: string;
  merek: string;
  tipe: string;
  plat: string;
  harga: number;
  masuk: string;
  hari: number;
}
