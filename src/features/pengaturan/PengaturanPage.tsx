import { Building2, User, Settings2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { APP_NAME, APP_TAGLINE } from '@/shared/constants';
import { useAppSelector } from '@/app/store';

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</label>
    <p className="mt-1.5 w-full min-h-11 flex items-center px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold text-ink-soft">
      {value || '-'}
    </p>
  </div>
);

/**
 * Backend belum punya endpoint pengaturan (lihat TASK.md — ecatalogue-be/.prd §16: "Laporan
 * dan Pengaturan... API khusus belum tersedia. Jangan mengarang endpoint."). Halaman ini
 * karena itu READ-ONLY — menampilkan data profil user yang sedang login (real, dari sesi
 * auth), bukan form editable dengan tombol Simpan yang tidak melakukan apa-apa.
 */
export const PengaturanPage = () => {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <PageHeader title="Pengaturan" description="Profil aplikasi & akun — pengelolaan pengaturan belum tersedia" />

      <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/10 px-4 py-3 text-[12px] font-semibold text-ink-soft flex items-center gap-2.5">
        <Settings2 size={16} className="text-accent-amber shrink-0" />
        Manajemen pengaturan (profil showroom, notifikasi, tema) belum tersedia — menunggu endpoint backend. Halaman ini hanya menampilkan info, belum bisa diubah.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Aplikasi" icon={<Building2 size={16} />}>
          <div className="space-y-4">
            <ReadOnlyField label="Nama Aplikasi" value={APP_NAME} />
            <ReadOnlyField label="Tagline" value={APP_TAGLINE} />
          </div>
        </SectionCard>

        <SectionCard title="Akun" icon={<User size={16} />}>
          <div className="space-y-4">
            <ReadOnlyField label="Nama Lengkap" value={user?.name ?? ''} />
            <ReadOnlyField label="Email" value={user?.email ?? ''} />
            <ReadOnlyField label="Username" value={user?.username ?? ''} />
            <ReadOnlyField label="Role" value={user?.role?.name ?? ''} />
            <ReadOnlyField label="Cabang" value={user?.branch?.name ?? ''} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
