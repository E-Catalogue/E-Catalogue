// Tipe data domain showroom mobil bekas Cars Showroom.

export type UnitStatus = 'ready' | 'rekondisi' | 'booked' | 'sold' | 'pembelian';
export type FuelType = 'Bensin' | 'Diesel' | 'Hybrid' | 'Listrik';
export type Transmission = 'AT' | 'MT' | 'CVT';

export interface Unit {
  id: string;
  code: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  buyPrice?: number;
  km: number;
  fuel: FuelType;
  transmission: Transmission;
  color: string;
  plate: string;
  status: UnitStatus;
  isNew?: boolean;
  image: string;
  rekondisiProgress?: number;
  rekondisiEta?: string;
  daysInStock?: number;
}

export type LeadStage = 'lead' | 'test_drive' | 'negosiasi' | 'spk';
export type LeadSource = 'Instagram' | 'Facebook' | 'Walk-in' | 'Referral' | 'OLX' | 'Website';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: LeadSource;
  interestedUnit: string;
  stage: LeadStage;
  budget: number;
  createdAt: string;
  followUpAt?: string;
}

export type ActivityType = 'purchase' | 'rekondisi' | 'lead' | 'sale' | 'payment';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  time: string;
}

export interface TestDrive {
  id: string;
  customer: string;
  unit: string;
  date: string;
  time: string;
  status: 'Terjadwal' | 'Selesai' | 'Batal';
}

export interface Sale {
  id: string;
  invoice: string;
  customer: string;
  unit: string;
  date: string;
  total: number;
  paymentType: 'Cash' | 'Kredit';
  status: 'Lunas' | 'DP' | 'Proses';
}

export interface Payment {
  id: string;
  invoice: string;
  customer: string;
  method: string;
  amount: number;
  date: string;
  status: 'Sukses' | 'Pending' | 'Gagal';
}

export type ExpenseCategory =
  | 'Investor'
  | 'Operasional Showroom'
  | 'Operasional Kendaraan'
  | 'Lainnya';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  name: string;
  amount: number;
  date: string;
  note?: string;
}
