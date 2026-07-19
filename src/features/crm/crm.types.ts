export type OrderStatus =
  | 'NEW' | 'INTERESTED' | 'FOLLOW_UP' | 'TEST_DRIVE'
  | 'APPROVED_KREDIT' | 'CASH_BUYER' | 'BOOKING' | 'DEAL'
  | 'REJECT_SLIK' | 'CANCEL';

export type PaymentType = 'CASH' | 'KREDIT';
export type StatusApproval = 'PENDING' | 'APPROVED' | 'REJECTED';

export type JenisPembayaran =
  | 'BOOKING_FEE' | 'DP' | 'PELUNASAN' | 'LEASING' | 'REFUND_LEASING';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: 'Baru',
  INTERESTED: 'Tertarik',
  FOLLOW_UP: 'Follow Up',
  TEST_DRIVE: 'Test Drive',
  APPROVED_KREDIT: 'Kredit Disetujui',
  CASH_BUYER: 'Cash Buyer',
  BOOKING: 'Booking',
  DEAL: 'Deal',
  REJECT_SLIK: 'Tolak SLIK',
  CANCEL: 'Batal',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  NEW: 'bg-slate-100 text-slate-600',
  INTERESTED: 'bg-blue-100 text-blue-600',
  FOLLOW_UP: 'bg-amber-100 text-amber-700',
  TEST_DRIVE: 'bg-purple-100 text-purple-600',
  APPROVED_KREDIT: 'bg-teal-100 text-teal-700',
  CASH_BUYER: 'bg-cyan-100 text-cyan-700',
  BOOKING: 'bg-orange-100 text-orange-700',
  DEAL: 'bg-green-100 text-green-700',
  REJECT_SLIK: 'bg-red-100 text-red-600',
  CANCEL: 'bg-rose-100 text-rose-600',
};

export const JENIS_PEMBAYARAN_LABEL: Record<JenisPembayaran, string> = {
  BOOKING_FEE: 'Booking Fee',
  DP: 'Uang Muka (DP)',
  PELUNASAN: 'Pelunasan',
  LEASING: 'Pencairan Leasing',
  REFUND_LEASING: 'Refund Leasing',
};

export interface Lead {
  id: string;
  nama: string;
  nik?: string | null;
  noHp?: string | null;
  email?: string | null;
  alamat?: string | null;
  pekerjaan?: string | null;
  sumberLeadId?: string | null;
  sumberLead?: { id: string; name: string } | null;
  ktpFileId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnitSummary {
  id: string;
  platNomor?: string | null;
  merek?: { name: string } | null;
  tipe?: { name: string } | null;
  hargaOtrSaatIni?: number | null;
  status?: string;
}

export interface SalesComboboxUser {
  id: string;
  name: string;
  email?: string | null;
  username?: string | null;
}

export interface LeadOrder {
  id: string;
  nomorOrder: string;
  leadId: string;
  lead?: Lead | null;
  unitId: string;
  unit?: UnitSummary | null;
  salesId?: string | null;
  sales?: { id: string; name: string } | null;
  hargaPenawaran?: number | null;
  diskonShowroom?: number | null;
  hargaFinal?: number | null;
  paymentType: PaymentType;
  leasingId?: string | null;
  leasing?: { id: string; name: string } | null;
  statusSlik?: string | null;
  statusApproval?: StatusApproval | null;
  status: OrderStatus;
  tanggalOrder?: string | null;
  catatan?: string | null;
  totalPaid?: number;
  remainingPayment?: number;
  isPaid?: boolean;
}

export interface LeadPayment {
  id: string;
  orderId?: string;
  amount: number;
  paymentDate: string;
  description?: string | null;
  jenisPembayaran: JenisPembayaran;
  buktiFileId?: string | null;
  createdAt?: string;
}

