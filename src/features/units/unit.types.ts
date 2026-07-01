export type StatusUnit = 'INVENTORY' | 'READY_STOCK' | 'HOLD' | 'SOLD';
export type Transmisi = 'MANUAL' | 'AUTOMATIC';

export interface Unit {
  id: string;
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
  hargaBeli: number;
  tanggalPembelian: string;
  cashAccountId?: string;
  purchaseCashTransactionId?: string | null;
  paidAt?: string | null;
  hpp?: number | null;
  hargaTargetJual?: number | null;
  hargaOtrSaatIni?: number | null;
  createdAt: string;
  updatedAt: string;

  // Relations (optional/included)
  merek?: { id: string; name: string };
  tipe?: { id: string; name: string; merekId: string };
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
  hargaBeli: number;
  tanggalPembelian: string; // ISO String
  cashAccountId?: string;
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
