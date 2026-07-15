import { Link } from '@tanstack/react-router';
import { ShieldOff, PackageX, Ban, ArrowLeft, type LucideIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

/**
 * Halaman kondisi akses Tenant Web (lihat `.menu/tenant-web.md` — Guard halaman):
 *   Permission tidak tersedia → /forbidden
 *   Capability tidak aktif    → /feature-unavailable
 *   Tenant suspended          → /tenant-suspended
 */
const StatePage = ({
  icon: Icon,
  tone,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  tone: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
    <div className="w-full max-w-md text-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${tone}`}>
        <Icon size={30} strokeWidth={2} />
      </div>
      <h1 className="text-xl font-extrabold text-ink">{title}</h1>
      <p className="mt-2 text-sm font-medium text-muted leading-relaxed">{message}</p>
      <div className="mt-7 flex items-center justify-center gap-3">
        {action ?? (
          <Link to="/">
            <Button variant="secondary" icon={<ArrowLeft size={16} />}>
              Kembali ke Dashboard
            </Button>
          </Link>
        )}
      </div>
    </div>
  </div>
);

export const ForbiddenPage = () => (
  <StatePage
    icon={ShieldOff}
    tone="bg-semantic-error/10 text-semantic-error"
    title="Akses Ditolak"
    message="Anda tidak memiliki permission untuk membuka halaman ini. Hubungi admin showroom bila menurut Anda ini keliru."
  />
);

export const FeatureUnavailablePage = () => (
  <StatePage
    icon={PackageX}
    tone="bg-accent-amber/10 text-accent-amber"
    title="Fitur Belum Aktif"
    message="Modul ini belum aktif untuk showroom Anda. Aktivasi capability dilakukan lewat Platform — hubungi penyedia layanan."
  />
);

export const TenantSuspendedPage = () => (
  <StatePage
    icon={Ban}
    tone="bg-semantic-error/10 text-semantic-error"
    title="Showroom Ditangguhkan"
    message="Akses ke ruang kerja ini sedang ditangguhkan. Silakan hubungi penyedia layanan untuk mengaktifkannya kembali."
    action={
      <Link to="/login">
        <Button variant="secondary" icon={<ArrowLeft size={16} />}>
          Kembali ke Login
        </Button>
      </Link>
    }
  />
);
