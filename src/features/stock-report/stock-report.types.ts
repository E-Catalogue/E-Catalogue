export interface StockKpi {
  totalActive: number;
  byStatus: { INVENTORY: number; READY_STOCK: number; HOLD: number };
  belumReady: number;
  hppValue: number;
  hppFinalizedValue: number;
  hppUnfinalizedValue: number;
  finalizedActiveCount: number;
  unfinalizedActiveCount: number;
  jualValue: number;
  avgAgeDays: number;
  slowMovingCount: number;
  potentialMargin: number;
}
export interface AgingBucket { bucket: string; count: number; hppValue: number }
export interface BranchComparison { id: string; nama: string; code: string; activeCount: number; hppValue: number; soldInRange: number; sellThrough: number }
export interface StockOverview {
  asOf: string;
  kpi: StockKpi;
  aging: AgingBucket[];
  belumReady: number;
  branches: BranchComparison[];
  movementSummary: { masuk: number; terjual: number; transfer: number; from: string; to: string };
}
export interface StockUnitRow {
  id: string; name: string; platNomor: string; merek: string | null; tipe: string | null;
  statusUnit: string; branch: { id: string; nama: string; code: string } | null;
  readyStockAt: string | null; ageDays: number | null; belumReady: boolean;
  hpp: number; hargaJual: number; margin: number | null; badge: string; bucket: string | null;
}
export type StockMovementType = 'IN' | 'SOLD' | 'TRANSFER' | 'STATUS_CHANGE';
export interface StockMovement { id: string; type: StockMovementType; label: string; date: string; unitName: string; platNomor: string; detail: string }
