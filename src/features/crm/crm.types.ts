/**
 * Order status — hanya 3 nilai sesuai kontrak backend real (lead-order.service.js
 * `updateStatus()` + ecatalogue-be/.prd/README.md §15 & §24 checklist "Tidak ada status
 * order funnel lama"). Nilai funnel lama (`NEW`, `INTERESTED`, `FOLLOW_UP`, `TEST_DRIVE`,
 * `APPROVED_KREDIT`, `CASH_BUYER`, `REJECT_SLIK`) SENGAJA dibuang — backend menolaknya
 * dengan `410 ORDER_FUNNEL_STATUS_DEPRECATED` (lihat DEPRECATED_FUNNEL_STATUS di service).
 */
export type OrderStatus = 'BOOKING' | 'DEAL' | 'CANCELLED';

export type PaymentType = 'CASH' | 'KREDIT';
export type StatusApproval = 'PENDING' | 'APPROVED' | 'REJECTED';
export type StatusSlik = 'LOLOS' | 'REJECT' | 'BI_CHECKING';

export type JenisPembayaran =
  | 'BOOKING_FEE' | 'DP' | 'TAMBAHAN_DP' | 'PELUNASAN'
  | 'LEASING' | 'PENCAIRAN_LEASING' | 'REFUND_LEASING';

/** `LeadPayment.postingStatus` — payment POSTED tidak boleh dihapus, hanya di-reverse. */
export type PaymentPostingStatus = 'POSTED' | 'REVERSED';

export type SettlementStatus = 'WAITING_PAYMENT' | 'WAITING_INCENTIVE' | 'FINALIZED' | 'REVERSED';
export type TaxReserveStatus = 'NOT_REQUIRED' | 'PENDING_TRANSFER' | 'TRANSFERRED';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  BOOKING: 'Booking',
  DEAL: 'Deal',
  CANCELLED: 'Batal',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  BOOKING: 'bg-orange-100 text-orange-700',
  DEAL: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-rose-100 text-rose-600',
};

export const JENIS_PEMBAYARAN_LABEL: Record<JenisPembayaran, string> = {
  BOOKING_FEE: 'Booking Fee',
  DP: 'Uang Muka (DP)',
  TAMBAHAN_DP: 'Tambahan DP',
  PELUNASAN: 'Pelunasan',
  LEASING: 'Pencairan Leasing',
  PENCAIRAN_LEASING: 'Pencairan Leasing',
  REFUND_LEASING: 'Refund Leasing',
};

export const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  WAITING_PAYMENT: 'Menunggu Pelunasan',
  WAITING_INCENTIVE: 'Menunggu Insentif',
  FINALIZED: 'Selesai',
  REVERSED: 'Dibalik',
};

export const SETTLEMENT_STATUS_COLOR: Record<SettlementStatus, string> = {
  WAITING_PAYMENT: 'bg-amber-100 text-amber-700',
  WAITING_INCENTIVE: 'bg-blue-100 text-blue-600',
  FINALIZED: 'bg-green-100 text-green-700',
  REVERSED: 'bg-rose-100 text-rose-600',
};

/** `Lead.status` — sesuai `updateLeadStatusSchema` (lead.validation.js). */
export type LeadStatus = 'NEW' | 'INTERESTED' | 'FOLLOW_UP' | 'TEST_DRIVE' | 'QUALIFIED' | 'WON' | 'LOST';

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: 'Baru',
  INTERESTED: 'Tertarik',
  FOLLOW_UP: 'Follow Up',
  TEST_DRIVE: 'Test Drive',
  QUALIFIED: 'Qualified',
  WON: 'Deal',
  LOST: 'Hilang',
};

export const LEAD_STATUS_COLOR: Record<LeadStatus, string> = {
  NEW: 'bg-slate-100 text-slate-600',
  INTERESTED: 'bg-blue-100 text-blue-700',
  FOLLOW_UP: 'bg-amber-100 text-amber-700',
  TEST_DRIVE: 'bg-purple-100 text-purple-700',
  QUALIFIED: 'bg-teal-100 text-teal-700',
  WON: 'bg-green-100 text-green-700',
  LOST: 'bg-rose-100 text-rose-600',
};

export interface Lead {
  id: string;
  nama: string;
  nik?: string | null;
  noHp?: string | null;
  email?: string | null;
  alamat?: string | null;
  pekerjaan?: string | null;
  status: LeadStatus;
  sumberLeadId?: string | null;
  sumberLead?: { id: string; name: string } | null;
  /** Media private KTP (`ktpUrl` backend, akses via authenticated endpoint private media). */
  ktpUrl?: string | null;
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
  branchId?: string;
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
  /** Diisi backend saat transisi ke DEAL — dipakai sebagai tanggal penjualan (README §24: jangan pakai `updatedAt`). */
  dealAt?: string | null;
  cancelledAt?: string | null;
  catatan?: string | null;
  totalPaid?: number;
  remainingPayment?: number;
  isPaid?: boolean;
}

export interface LeadPayment {
  id: string;
  leadOrderId: string;
  branchId?: string;
  amount: number;
  paymentDate: string;
  description?: string | null;
  jenisPembayaran: JenisPembayaran;
  /** URL private (`/api/v1/private-media/payment/:id/proof`) — akses via authenticated fetch/blob, bukan `<img src>` langsung. */
  buktiUrl?: string | null;
  cashAccountId?: string | null;
  cashAccount?: { id: string; name: string; code: string; type: string } | null;
  cashTransactionId?: string | null;
  postingStatus: PaymentPostingStatus;
  idempotencyKey?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Response `POST /lead-orders/:orderId/payments/:id/reverse` — payment sudah ter-update + entri kas kompensasi. */
export interface LeadPaymentReverseResult {
  payment: LeadPayment;
  reversal: { id: string; [key: string]: unknown };
}

export interface SaleSettlement {
  id: string;
  orderId: string;
  unitId: string;
  fundingAgreementId: string;
  branchId: string;
  status: SettlementStatus;
  finalPrice: number;
  purchaseCost: number;
  initialReconditioningCost: number;
  pricingCostBasis: number;
  additionalReconditioningCost: number;
  profitBasis: number;
  investorProfit: number;
  fixedReturnAccrued: number;
  companyProfitBeforeCost: number;
  salesIncentiveAmount: number | null;
  companyProfitBeforeTax: number | null;
  taxRateSnapshot: number;
  taxProvision: number | null;
  companyNetProfit: number | null;
  taxReserveStatus: TaxReserveStatus;
  taxTransferGroupId?: string | null;
  finalizedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  branch?: { id: string; nama: string; code: string } | null;
  fundingAgreement?: {
    id: string;
    fundingSource: string;
    scheme: string;
    investorId: string;
    principalAmount: number;
    status: string;
  } | null;
}
