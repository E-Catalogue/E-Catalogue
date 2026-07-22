export type TestDriveStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface TestDriveUnitLookup {
  id: string;
  branchId: string;
  platNomor: string;
  tahun: number;
  warna: string;
  otrPrice?: number | null;
  merek?: { name: string } | null;
  tipe?: { name: string } | null;
}

export interface TestDriveSalesLookup {
  id: string;
  branchId?: string;
  name: string;
  username?: string | null;
}

export interface TestDriveLeadLookup {
  id: string;
  branchId?: string;
  nama: string;
  nik?: string | null;
  status?: string;
}

/** `.prd/update_module_owned_lookup_20260721.md` §4.10 — agregat lead/unit/sales. */
export interface TestDriveFormLookup {
  leads: TestDriveLeadLookup[];
  units: TestDriveUnitLookup[];
  sales: TestDriveSalesLookup[];
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
