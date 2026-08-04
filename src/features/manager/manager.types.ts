export type ManagerUnitStatus = 'INVENTORY' | 'RECONDITIONING' | 'READY_STOCK' | 'HOLD' | 'SOLD';

export interface ManagerUnit {
  id: string;
  name: string;
  statusUnit: ManagerUnitStatus;
  platNomor: string;
  tahun: number;
  warna: string | null;
  transmisi: string;
  kilometer: number;
  tanggalPajak: string | null;
  variant: string | null;
  bahanBakar: string | null;
  deskripsi: string | null;
  otrPrice: number | null;
  canShare: boolean;
  catalogPath: string | null;
  branch: { id: string; nama: string; code: string };
  merek: { id: string; name: string } | null;
  tipe: { id: string; name: string } | null;
  images: { id: string; filename: string; originalName: string; sequence: number; isMain: boolean }[];
  kelengkapans: { id: string; name: string; code: string }[];
  dokumens: { id: string; name: string; code: string }[];
}

export interface ManagerTargetUnitSummary {
  period: string;
  status: string;
  branch: { id: string; nama: string; code: string };
  unitTarget: number;
  unitActual: number;
  remainingUnit: number;
  achievementPercent: number;
}
