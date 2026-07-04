export type TestDriveStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface TestDriveUnitLookup {
  id: string;
  platNomor: string;
  merekName: string;
  tipeName: string;
  tahun: number;
  warna: string;
  hargaOtrSaatIni?: number | null;
  statusUnit: 'READY_STOCK';
}

export interface TestDriveSalesLookup {
  id: string;
  name: string;
  email?: string | null;
  username?: string | null;
}

export interface TestDrive {
  id: string;
  leadId: string;
  unitId: string;
  salesId?: string | null;
  scheduledAt: string;
  status: TestDriveStatus;
  fotoKtpUrl?: string | null;
  fotoSimUrl?: string | null;
  catatan?: string | null;
  lead?: { id: string; nama: string; nik?: string | null } | null;
  unit?: {
    id: string;
    platNomor: string;
    merek?: { name: string } | null;
    tipe?: { name: string } | null;
  } | null;
  sales?: { id: string; name: string } | null;
}

export interface TestDriveListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  salesId?: string;
  leadId?: string;
  unitId?: string;
}
