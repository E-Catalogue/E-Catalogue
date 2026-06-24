import type {
  Unit,
  Lead,
  Activity,
  TestDrive,
  Sale,
  Payment,
  Expense,
} from './types';

// Galeri foto mobil (Unsplash) untuk dummy.
const IMG = {
  fortuner: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?q=80&w=1200&auto=format&fit=crop',
  crv: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop',
  xpander: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop',
  cx5: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
  innova: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1200&auto=format&fit=crop',
  xl7: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop',
  terios: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop',
  brio: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop',
  pajero: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1200&auto=format&fit=crop',
  rush: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200&auto=format&fit=crop',
  civic: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?q=80&w=1200&auto=format&fit=crop',
  hrv: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=1200&auto=format&fit=crop',
};

export const UNITS: Unit[] = [
  {
    id: 'u1', code: 'CS-2401', brand: 'Toyota', model: 'Fortuner', variant: '2.4 G AT',
    year: 2021, price: 425_000_000, buyPrice: 385_000_000, km: 28_000, fuel: 'Diesel',
    transmission: 'AT', color: 'Hitam', plate: 'B 1234 ABC', status: 'ready', isNew: true,
    image: IMG.fortuner, daysInStock: 12,
  },
  {
    id: 'u2', code: 'CS-2402', brand: 'Honda', model: 'CR-V', variant: '1.5 Turbo',
    year: 2020, price: 395_000_000, buyPrice: 360_000_000, km: 35_000, fuel: 'Bensin',
    transmission: 'CVT', color: 'Putih', plate: 'B 2345 BCD', status: 'ready', isNew: true,
    image: IMG.crv, daysInStock: 18,
  },
  {
    id: 'u3', code: 'CS-2403', brand: 'Mitsubishi', model: 'Xpander', variant: 'Ultimate',
    year: 2022, price: 275_000_000, buyPrice: 248_000_000, km: 20_000, fuel: 'Bensin',
    transmission: 'AT', color: 'Abu-abu', plate: 'B 3456 CDE', status: 'ready', isNew: true,
    image: IMG.xpander, daysInStock: 9,
  },
  {
    id: 'u4', code: 'CS-2404', brand: 'Mazda', model: 'CX-5', variant: 'Elite AWD',
    year: 2021, price: 465_000_000, buyPrice: 420_000_000, km: 30_000, fuel: 'Bensin',
    transmission: 'AT', color: 'Merah', plate: 'B 4567 DEF', status: 'ready', isNew: true,
    image: IMG.cx5, daysInStock: 15,
  },
  {
    id: 'u5', code: 'CS-2405', brand: 'Toyota', model: 'Innova Reborn', variant: '2.4 G AT',
    year: 2019, price: 320_000_000, buyPrice: 295_000_000, km: 62_000, fuel: 'Diesel',
    transmission: 'AT', color: 'Silver', plate: 'B 5678 EFG', status: 'rekondisi',
    image: IMG.innova, rekondisiProgress: 60, rekondisiEta: '2024-05-24',
  },
  {
    id: 'u6', code: 'CS-2406', brand: 'Suzuki', model: 'XL7', variant: 'Alpha',
    year: 2021, price: 215_000_000, buyPrice: 195_000_000, km: 41_000, fuel: 'Bensin',
    transmission: 'AT', color: 'Hitam', plate: 'B 6789 FGH', status: 'rekondisi',
    image: IMG.xl7, rekondisiProgress: 40, rekondisiEta: '2024-05-23',
  },
  {
    id: 'u7', code: 'CS-2407', brand: 'Daihatsu', model: 'Terios', variant: 'R Deluxe',
    year: 2020, price: 198_000_000, buyPrice: 178_000_000, km: 48_000, fuel: 'Bensin',
    transmission: 'AT', color: 'Putih', plate: 'B 7890 GHI', status: 'rekondisi',
    image: IMG.terios, rekondisiProgress: 70, rekondisiEta: '2024-05-26',
  },
  {
    id: 'u8', code: 'CS-2408', brand: 'Honda', model: 'Brio', variant: 'RS CVT',
    year: 2022, price: 175_000_000, buyPrice: 158_000_000, km: 15_000, fuel: 'Bensin',
    transmission: 'CVT', color: 'Kuning', plate: 'B 8901 HIJ', status: 'ready',
    image: IMG.brio, daysInStock: 21,
  },
  {
    id: 'u9', code: 'CS-2409', brand: 'Mitsubishi', model: 'Pajero Sport', variant: 'Dakar 4x2',
    year: 2020, price: 445_000_000, buyPrice: 405_000_000, km: 52_000, fuel: 'Diesel',
    transmission: 'AT', color: 'Putih', plate: 'B 9012 IJK', status: 'booked',
    image: IMG.pajero, daysInStock: 30,
  },
  {
    id: 'u10', code: 'CS-2410', brand: 'Toyota', model: 'Rush', variant: 'S GR Sport',
    year: 2021, price: 245_000_000, buyPrice: 222_000_000, km: 33_000, fuel: 'Bensin',
    transmission: 'AT', color: 'Hitam', plate: 'B 1010 JKL', status: 'booked',
    image: IMG.rush, daysInStock: 7,
  },
  {
    id: 'u11', code: 'CS-2411', brand: 'Honda', model: 'Civic', variant: 'RS Turbo',
    year: 2022, price: 510_000_000, buyPrice: 470_000_000, km: 18_000, fuel: 'Bensin',
    transmission: 'CVT', color: 'Merah', plate: 'B 1111 KLM', status: 'sold',
    image: IMG.civic, daysInStock: 4,
  },
  {
    id: 'u12', code: 'CS-2412', brand: 'Honda', model: 'HR-V', variant: 'SE',
    year: 2023, price: 365_000_000, km: 9_000, fuel: 'Bensin',
    transmission: 'CVT', color: 'Abu-abu', plate: 'B 1212 LMN', status: 'pembelian',
    image: IMG.hrv,
  },
];

export const LEADS: Lead[] = [
  { id: 'l1', name: 'Andi Setiawan', phone: '0812-1111-2222', source: 'Instagram', interestedUnit: 'Mazda CX-5 Elite AWD', stage: 'lead', budget: 460_000_000, createdAt: '2024-05-21', followUpAt: '2024-05-22' },
  { id: 'l2', name: 'Rina Marlina', phone: '0813-2222-3333', source: 'Walk-in', interestedUnit: 'Toyota Fortuner 2.4 G', stage: 'test_drive', budget: 430_000_000, createdAt: '2024-05-20', followUpAt: '2024-05-22' },
  { id: 'l3', name: 'Budi Santoso', phone: '0814-3333-4444', source: 'OLX', interestedUnit: 'Honda CR-V Turbo', stage: 'negosiasi', budget: 390_000_000, createdAt: '2024-05-19', followUpAt: '2024-05-23' },
  { id: 'l4', name: 'Siti Nurhaliza', phone: '0815-4444-5555', source: 'Referral', interestedUnit: 'Mitsubishi Xpander', stage: 'spk', budget: 280_000_000, createdAt: '2024-05-18' },
  { id: 'l5', name: 'Joko Widodo', phone: '0816-5555-6666', source: 'Facebook', interestedUnit: 'Toyota Rush GR Sport', stage: 'lead', budget: 250_000_000, createdAt: '2024-05-21', followUpAt: '2024-05-24' },
  { id: 'l6', name: 'Dewi Lestari', phone: '0817-6666-7777', source: 'Website', interestedUnit: 'Honda Brio RS', stage: 'test_drive', budget: 180_000_000, createdAt: '2024-05-20', followUpAt: '2024-05-22' },
  { id: 'l7', name: 'Agus Salim', phone: '0818-7777-8888', source: 'Instagram', interestedUnit: 'Pajero Sport Dakar', stage: 'negosiasi', budget: 450_000_000, createdAt: '2024-05-17', followUpAt: '2024-05-23' },
];

export const ACTIVITIES: Activity[] = [
  { id: 'a1', type: 'purchase', title: 'Unit Toyota Fortuner 2.4 G AT', subtitle: 'berhasil dibeli dari Pak Budi', time: '10 menit yang lalu' },
  { id: 'a2', type: 'rekondisi', title: 'Rekondisi Honda CR-V 1.5 Turbo', subtitle: 'progress 80%', time: '30 menit yang lalu' },
  { id: 'a3', type: 'lead', title: 'Lead baru dari Instagram', subtitle: 'atas nama Andi Setiawan', time: '1 jam yang lalu' },
  { id: 'a4', type: 'sale', title: 'Penjualan unit Mazda CX-5 Elite AWD', subtitle: 'berhasil dibuat', time: '2 jam yang lalu' },
  { id: 'a5', type: 'payment', title: 'Pembayaran DP dari Budi Santoso', subtitle: 'sebesar Rp 50.000.000', time: '3 jam yang lalu' },
];

// Grafik penjualan harian (Mei).
export const SALES_TREND: { label: string; value: number }[] = [
  { label: '1 Mei', value: 4 },
  { label: '4 Mei', value: 7 },
  { label: '7 Mei', value: 9 },
  { label: '10 Mei', value: 11 },
  { label: '14 Mei', value: 13 },
  { label: '17 Mei', value: 12 },
  { label: '21 Mei', value: 18 },
  { label: '24 Mei', value: 22 },
  { label: '28 Mei', value: 28 },
  { label: '31 Mei', value: 33 },
];

export const TEST_DRIVES: TestDrive[] = [
  { id: 't1', customer: 'Rina Marlina', unit: 'Toyota Fortuner 2.4 G', date: '2024-05-22', time: '10:00', status: 'Terjadwal' },
  { id: 't2', customer: 'Dewi Lestari', unit: 'Honda Brio RS CVT', date: '2024-05-22', time: '13:30', status: 'Terjadwal' },
  { id: 't3', customer: 'Hendra Wijaya', unit: 'Mazda CX-5 Elite', date: '2024-05-21', time: '15:00', status: 'Selesai' },
  { id: 't4', customer: 'Maya Sari', unit: 'Mitsubishi Xpander Ultimate', date: '2024-05-21', time: '09:00', status: 'Batal' },
];

export const SALES: Sale[] = [
  { id: 's1', invoice: 'INV-2405-011', customer: 'Hendra Wijaya', unit: 'Honda Civic RS Turbo', date: '2024-05-21', total: 510_000_000, paymentType: 'Kredit', status: 'DP' },
  { id: 's2', invoice: 'INV-2405-010', customer: 'Maya Sari', unit: 'Toyota Rush GR Sport', date: '2024-05-20', total: 245_000_000, paymentType: 'Cash', status: 'Lunas' },
  { id: 's3', invoice: 'INV-2405-009', customer: 'Budi Santoso', unit: 'Mazda CX-5 Elite AWD', date: '2024-05-19', total: 465_000_000, paymentType: 'Kredit', status: 'Proses' },
  { id: 's4', invoice: 'INV-2405-008', customer: 'Rina Marlina', unit: 'Mitsubishi Pajero Sport', date: '2024-05-18', total: 445_000_000, paymentType: 'Cash', status: 'Lunas' },
];

export const PAYMENTS: Payment[] = [
  { id: 'p1', invoice: 'INV-2405-011', customer: 'Hendra Wijaya', method: 'Transfer BCA', amount: 50_000_000, date: '2024-05-21', status: 'Sukses' },
  { id: 'p2', invoice: 'INV-2405-010', customer: 'Maya Sari', method: 'Cash', amount: 245_000_000, date: '2024-05-20', status: 'Sukses' },
  { id: 'p3', invoice: 'INV-2405-009', customer: 'Budi Santoso', method: 'Transfer Mandiri', amount: 100_000_000, date: '2024-05-19', status: 'Pending' },
  { id: 'p4', invoice: 'INV-2405-008', customer: 'Rina Marlina', method: 'QRIS', amount: 445_000_000, date: '2024-05-18', status: 'Sukses' },
];

export const EXPENSES: Expense[] = [
  { id: 'e1', category: 'Investor', name: 'Fee Investor (2.5%)', amount: 25_000_000, date: '2024-05-01', note: 'Otomatis bulanan' },
  { id: 'e2', category: 'Operasional Showroom', name: 'Gaji Karyawan', amount: 18_000_000, date: '2024-05-01' },
  { id: 'e3', category: 'Operasional Showroom', name: 'Sewa Kontrakan', amount: 8_000_000, date: '2024-05-03' },
  { id: 'e4', category: 'Operasional Showroom', name: 'Iklan OLX & Instagram', amount: 3_500_000, date: '2024-05-10' },
  { id: 'e5', category: 'Operasional Showroom', name: 'Listrik & Wifi', amount: 2_200_000, date: '2024-05-12' },
  { id: 'e6', category: 'Operasional Kendaraan', name: 'Bensin & Tol', amount: 1_400_000, date: '2024-05-15' },
  { id: 'e7', category: 'Lainnya', name: 'ATK & Perlengkapan', amount: 750_000, date: '2024-05-18' },
];

// Saldo awal kas (untuk perhitungan cash flow demo).
export const SALDO_AWAL = 150_000_000;

// Ringkasan dashboard.
export const DASHBOARD_STATS = {
  totalStock: 42,
  readyStock: 28,
  rekondisi: 7,
  leads: 56,
  followUpToday: 12,
  soldThisMonth: 18,
  soldTarget: 30,
  omzet: 3_240_000_000,
  omzetTarget: 5_000_000_000,
  booked: 5,
  pending: 3,
  avgDaysInStock: 26,
  totalValue: 8_240_000_000,
};

export const PIPELINE = [
  { stage: 'Lead / Prospek', count: 56, key: 'lead' as const },
  { stage: 'Test Drive', count: 24, key: 'test_drive' as const },
  { stage: 'Negosiasi', count: 12, key: 'negosiasi' as const },
  { stage: 'SPK / Deal', count: 7, key: 'spk' as const },
];

export const CONVERSION_RATE = 12.5;
