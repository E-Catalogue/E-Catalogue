import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { Button } from '@/shared/components/ui/Button';
import { usePermissions } from '@/features/auth/usePermissions';
import { Save, Building2 } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';

// MOCK Data (TDD UI)
const MOCK_PROFILE = {
  id: 'tenant-1',
  slug: 'acme',
  name: 'Acme Corporation',
  status: 'ACTIVE',
  createdAt: '2026-07-10',
  updatedAt: '2026-07-12',
};

type TenantProfileData = typeof MOCK_PROFILE;

const fetchMockProfile = async () => {
  return new Promise<typeof MOCK_PROFILE>((resolve) => setTimeout(() => resolve(MOCK_PROFILE), 600));
};

export const TenantProfilePage = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: fetchMockProfile,
  });

  if (error) {
    return <div className="p-6 text-center text-semantic-error">Gagal memuat profil showroom.</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Profil Showroom"
        description="Informasi ruang kerja dan identitas perusahaan Anda."
      />

      {isLoading || !profile ? (
        <div className="bg-surface border border-border rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted">Memuat profil...</p>
        </div>
      ) : (
        /* key → form di-mount ulang saat profil termuat, jadi state ter-init dari data
           tanpa perlu menyinkronkan lewat useEffect. */
        <ProfileForm key={profile.id} profile={profile} />
      )}
    </div>
  );
};

const ProfileForm = ({ profile }: { profile: TenantProfileData }) => {
  const { can } = usePermissions();
  const [name, setName] = useState(profile.name);

  const handleSave = () => {
    // TODO(api): panggil tenantProfileApi.updateProfile({ name }) saat backend siap.
    console.log('Save profile:', { name });
  };

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm max-w-3xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center shrink-0">
              <Building2 size={32} className="text-accent-blue" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-ink">{profile.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm font-mono text-muted">{profile.slug}.ecatalogue.com</p>
                <StatusBadge status={profile.status} />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextField 
                label="Nama Perusahaan" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                disabled={!can('tenant.profile.update')}
              />
              <TextField 
                label="Slug (Subdomain)" 
                value={profile.slug} 
                disabled 
                helperText="Subdomain bersifat permanen dan tidak dapat diubah secara mandiri. Hubungi dukungan platform untuk perubahan."
              />
              <TextField 
                label="Tanggal Mendaftar" 
                value={profile.createdAt} 
                disabled 
              />
              <SelectField 
                label="Status Showroom"
                value={profile.status} 
                disabled 
                options={[{ value: profile.status, label: profile.status }]}
                helperText="Status keanggotaan dikelola oleh Platform."
              />
            </div>

            {can('tenant.profile.update') && (
              <div className="pt-4 border-t border-divider flex justify-end">
                <Button 
                  icon={<Save size={16} />} 
                  onClick={handleSave}
                  disabled={name === profile.name || !name.trim()}
                >
                  Simpan Perubahan
                </Button>
              </div>
            )}
      </div>
    </div>
  );
};
