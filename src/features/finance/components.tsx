import { useMemo, type ChangeEvent } from 'react';
import { AlertTriangle } from 'lucide-react';
import { NumericField } from '@/shared/components/ui/Field';
import { SearchableSelect, type SearchableSelectOption } from '@/shared/components/ui/SearchableSelect';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/core/utils/format';
import type { CashAccountOption, CategoryOption } from './lookup';

/**
 * Pesan banner inline per error code finansial dipakai lintas modul finance (README §17 — jangan
 * hanya toast untuk error finansial; user harus bisa melihat apakah transaksi kemungkinan sudah
 * terposting). Dikonfirmasi dari kode backend (`cash-transaction.service.js` `lockAndAssertBalance`,
 * `assertOpenPeriod`, `cash-account.service.js` `assertActiveCashAccount`, `branch-scope.middleware.js`).
 */
// eslint-disable-next-line react-refresh/only-export-components
export const FINANCE_ERROR_BANNER: Record<string, { title: string; message: string }> = {
  BRANCH_CONTEXT_REQUIRED: { title: 'Cabang belum dipilih', message: 'Pilih cabang konkret terlebih dahulu, lalu coba lagi.' },
  INSUFFICIENT_BALANCE: { title: 'Saldo akun kas tidak mencukupi', message: 'Draft dipertahankan — periksa saldo akun kas sebelum mencoba lagi.' },
  CASH_ACCOUNT_NOT_FOUND: { title: 'Akun kas tidak ditemukan', message: 'Pilih akun kas lain yang aktif pada cabang ini.' },
  CASH_ACCOUNT_INACTIVE: { title: 'Akun kas tidak aktif', message: 'Pilih akun kas lain yang aktif.' },
  BOOK_PERIOD_CLOSED: { title: 'Periode pembukuan sudah ditutup', message: 'Pilih tanggal pada periode pembukuan yang masih terbuka.' },
  CROSS_BRANCH_RELATION: { title: 'Relasi lintas cabang', message: 'Salah satu relasi berasal dari cabang berbeda. Data akan dimuat ulang.' },
  BRANCH_SCOPE_FORBIDDEN: { title: 'Cabang tidak sesuai', message: 'Reset selector cabang lalu muat ulang data.' },
  OPERATIONAL_EXPENSE_ALREADY_PAID: { title: 'Pengeluaran sudah dibayar', message: 'Status pengeluaran telah berubah — daftar akan dimuat ulang.' },
  OPERATIONAL_EXPENSE_CANCELLED: { title: 'Pengeluaran sudah dibatalkan', message: 'Pengeluaran ini tidak dapat dibayar lagi.' },
  OPERATIONAL_EXPENSE_NOT_EDITABLE: { title: 'Pengeluaran tidak dapat diubah', message: 'Pengeluaran yang sudah dibayar tidak dapat diperbarui.' },
  PAYROLL_RUN_NOT_PAYABLE: { title: 'Payroll tidak dapat dibayar', message: 'Status payroll telah berubah — data akan dimuat ulang.' },
  PAYROLL_RUN_NOT_EDITABLE: { title: 'Payroll tidak dapat diubah', message: 'Payroll yang sudah dibayar tidak dapat diubah.' },
  PAYROLL_RUN_ALREADY_EXISTS: { title: 'Payroll periode ini sudah ada', message: 'Payroll untuk periode tersebut sudah pernah digenerate.' },
  PAYROLL_RUN_EMPTY: { title: 'Tidak ada data untuk digenerate', message: 'Tidak ada gapok aktif atau insentif draft pada periode ini.' },
  INVALID_BOOK_PERIOD: { title: 'Format periode tidak valid', message: 'Gunakan format YYYY-MM.' },
  BOOK_PERIOD_NOT_FOUND: { title: 'Periode belum ditutup', message: 'Belum ada snapshot pembukuan tersimpan untuk periode ini.' },
  BOOK_PERIOD_ALREADY_CLOSED: { title: 'Periode sudah ditutup', message: 'Data akan dimuat ulang.' },
  BOOK_PERIOD_NOT_FINISHED: { title: 'Periode belum bisa ditutup', message: 'Hanya periode yang sudah lewat (bukan bulan berjalan/masa depan) yang bisa ditutup.' },
  TAX_ACCOUNTS_MUST_DIFFER: { title: 'Akun sumber & cadangan harus berbeda', message: 'Pilih dua akun kas yang berbeda.' },
  INVALID_TAX_CASH_ACCOUNT: { title: 'Akun kas tidak valid', message: 'Akun harus aktif dan berasal dari cabang yang sama.' },
};
const FINANCE_FALLBACK_5XX_BANNER = { title: 'Permintaan gagal diproses', message: 'Draft dipertahankan — transaksi mungkin sudah terposting di server. Coba lagi manual, jangan mengulang otomatis.' };

export const FinanceErrorBanner = ({ code, message, onDismiss }: { code?: string; message: string; onDismiss: () => void }) => {
  const mapped = (code && FINANCE_ERROR_BANNER[code]) || (!code ? FINANCE_FALLBACK_5XX_BANNER : undefined);
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-semantic-error/10 border border-semantic-error/30 text-semantic-error">
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold">{mapped?.title ?? 'Terjadi kesalahan'}</p>
        <p className="text-[11px] font-medium mt-0.5 leading-relaxed">{mapped?.message ?? message}</p>
      </div>
      <button type="button" onClick={onDismiss} className="text-[11px] font-bold underline shrink-0">Tutup</button>
    </div>
  );
};

/**
 * Select-select ini SEKARANG presentational — datanya dipasok caller lewat prop (bukan lagi fetch
 * `/finance/lookups/*` internal, yang sudah dihapus backend, `.prd/update_module_owned_lookup`).
 * Setiap halaman memanggil hook lookup module-nya sendiri (lihat `finance/lookup.ts`) dan mengoper
 * hasilnya ke sini. Semua pakai `SearchableSelect` (ada input pencarian di dalam dropdown).
 */
interface PresentationalSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

/** Format label akun kas: "Nama (KODE · TIPE)" + sublabel default penjualan. */
const cashAccountOption = (x: CashAccountOption): SearchableSelectOption => ({
  value: x.id,
  label: `${x.name} (${x.code} · ${x.type})`,
  sublabel: x.defaultPayment ? 'Default penjualan' : undefined,
});

export const CashAccountSelect = ({ value, onChange, label = 'Akun Kas', required, disabled, loading, accounts }: PresentationalSelectProps & { accounts: CashAccountOption[] }) => {
  const options = useMemo(() => accounts.map(cashAccountOption), [accounts]);
  return <SearchableSelect label={label} required={required} disabled={disabled} loading={loading} value={value} onChange={onChange} options={options} placeholder="Pilih akun kas" searchPlaceholder="Cari akun kas..." emptyMessage="Tidak ada akun kas aktif." />;
};

export const ExpenseCategorySelect = ({ value, onChange, label = 'Kategori', required, disabled, loading, categories }: PresentationalSelectProps & { categories: CategoryOption[] }) => {
  const options = useMemo(() => categories.map((x) => ({ value: x.id, label: x.code ? `${x.name} (${x.code})` : x.name })), [categories]);
  return <SearchableSelect label={label} required={required} disabled={disabled} loading={loading} value={value} onChange={onChange} options={options} placeholder="Pilih kategori" searchPlaceholder="Cari kategori..." emptyMessage="Tidak ada kategori aktif." />;
};

export interface UserOption { id: string; name: string; username: string; role?: { code?: string; name?: string } | null }
export const PayrollUserSelect = ({ value, onChange, label = 'User', required, disabled, loading, users }: PresentationalSelectProps & { users: UserOption[] }) => {
  const options = useMemo(() => users.map((x) => ({ value: x.id, label: x.name, sublabel: `${x.username}${x.role?.name ? ` · ${x.role.name}` : ''}` })), [users]);
  return <SearchableSelect label={label} required={required} disabled={disabled} loading={loading} value={value} onChange={onChange} options={options} placeholder="Pilih user" searchPlaceholder="Cari user..." emptyMessage="Tidak ada user aktif." />;
};

export const SalesSelect = ({ value, onChange, label = 'Sales', required, disabled, loading, sales }: PresentationalSelectProps & { sales: Array<{ id: string; name: string; username: string }> }) => {
  const options = useMemo(() => sales.map((x) => ({ value: x.id, label: x.name, sublabel: x.username })), [sales]);
  return <SearchableSelect label={label} required={required} disabled={disabled} loading={loading} value={value} onChange={onChange} options={options} placeholder="Pilih sales" searchPlaceholder="Cari sales..." emptyMessage="Tidak ada sales aktif." />;
};

export interface DealOrderOption { id: string; nomorOrder: string; customerName?: string | null; hargaFinal: number; dealDate?: string | null }
export const DealOrderSelect = ({ value, onChange, label = 'Sales Order', required, disabled, loading, orders }: PresentationalSelectProps & { orders: DealOrderOption[] }) => {
  const options = useMemo(() => orders.map((x) => ({
    value: x.id,
    label: `${x.nomorOrder} · ${x.customerName ?? '-'}`,
    sublabel: `${formatCurrency(x.hargaFinal, { compact: true })}${x.dealDate ? ` · ${formatDate(x.dealDate)}` : ''}`,
  })), [orders]);
  return <SearchableSelect label={label} required={required} disabled={disabled} loading={loading} value={value} onChange={onChange} options={options} placeholder="Pilih order DEAL" searchPlaceholder="Cari order..." emptyMessage="Tidak ada order DEAL." />;
};

interface CurrencyFieldProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  wrapClass?: string;
  placeholder?: string;
}

/**
 * Dulunya `<input type="number">` polos (tidak ada pemisah ribuan sama sekali selagi mengetik).
 * Sekarang jadi wrapper tipis di atas `NumericField` (yang sudah benar format "1.000.000") supaya
 * tetap kompatibel dengan pemakaian lama berbasis `value: string` + `onChange: (e) => void` tanpa
 * mengubah semua pemanggil.
 */
export const CurrencyField = ({ label, value, onChange, required, disabled, wrapClass, placeholder }: CurrencyFieldProps) => {
  const numValue = Number(value) || 0;
  const handleChange = (v: number) => {
    onChange({ target: { value: String(v) } } as ChangeEvent<HTMLInputElement>);
  };
  return (
    <NumericField
      label={label}
      required={required}
      disabled={disabled}
      value={numValue}
      onChange={handleChange}
      prefix="Rp"
      wrapClass={wrapClass}
      placeholder={placeholder}
    />
  );
};

export const FinanceStatusBadge = ({ status }: { status: string }) => <StatusBadge status={status} />;
