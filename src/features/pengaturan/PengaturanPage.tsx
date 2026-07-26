import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Building2, Eye, EyeOff, KeyRound, User, Settings2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { APP_NAME, APP_TAGLINE } from '@/shared/constants';
import { useAppSelector } from '@/app/store';
import { useAppDispatch } from '@/app/store';
import { clearCredentials } from '@/app/store/authSlice';
import { showToast } from '@/app/store/uiSlice';
import { queryClient } from '@/app/queryClient';
import { authApi } from '@/features/auth/auth.api';
import { Button } from '@/shared/components/ui/Button';
import { getApiErrorCode, getFieldErrors } from '@/core/api/apiError';

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</label>
    <p className="mt-1.5 w-full min-h-11 flex items-center px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold text-ink-soft">
      {value || '-'}
    </p>
  </div>
);

const PasswordInput = ({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">{label} <span className="text-primary">*</span></label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={label === 'Password Saat Ini' ? 'current-password' : 'new-password'}
          className={`w-full h-11 px-3.5 pr-11 rounded-xl bg-surface-soft border text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary-light ${error ? 'border-semantic-error' : 'border-border focus:border-primary'}`}
        />
        <button type="button" onClick={() => setVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary" aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <p className="mt-1 text-[11px] font-semibold text-semantic-error">{error}</p>}
    </div>
  );
};

const ChangePasswordCard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: async () => {
      queryClient.clear();
      dispatch(clearCredentials());
      dispatch(showToast({ type: 'general', variant: 'success', title: 'Password berhasil diubah', message: 'Silakan login kembali.' }));
      await navigate({ to: '/login', replace: true });
    },
    onError: (error: unknown) => {
      const code = getApiErrorCode(error);
      const fields = getFieldErrors(error);
      if (code === 'INVALID_CURRENT_PASSWORD') fields.currentPassword = 'Password saat ini tidak sesuai.';
      if (code === 'PASSWORD_UNCHANGED') fields.newPassword = 'Password baru harus berbeda dari password saat ini.';
      if (code === 'INVALID_ACCESS_TOKEN' || code === 'SESSION_REVOKED') {
        queryClient.clear();
        dispatch(clearCredentials());
        void navigate({ to: '/login', replace: true });
        return;
      }
      setServerErrors(fields);
    },
  });

  const clientErrors: Record<string, string> = {};
  if (newPassword && (newPassword.length < 8 || newPassword.length > 128)) clientErrors.newPassword = 'Password baru harus 8–128 karakter.';
  if (confirmation && confirmation !== newPassword) clientErrors.confirmation = 'Konfirmasi password belum sama.';
  const errors = { ...clientErrors, ...serverErrors };
  const valid = !!currentPassword && newPassword.length >= 8 && newPassword.length <= 128 && confirmation === newPassword;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setServerErrors({});
    if (valid) mutation.mutate();
  };

  return (
    <SectionCard title="Ubah Password" icon={<KeyRound size={16} />}>
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/10 px-3.5 py-3 text-[11px] font-semibold text-ink-soft">
          Setelah password berhasil diubah, seluruh sesi di semua perangkat akan dikeluarkan.
        </div>
        <PasswordInput label="Password Saat Ini" value={currentPassword} onChange={(v) => { setCurrentPassword(v); setServerErrors({}); }} error={errors.currentPassword} />
        <PasswordInput label="Password Baru" value={newPassword} onChange={(v) => { setNewPassword(v); setServerErrors({}); }} error={errors.newPassword} />
        <PasswordInput label="Konfirmasi Password Baru" value={confirmation} onChange={(v) => { setConfirmation(v); setServerErrors({}); }} error={errors.confirmation} />
        <Button type="submit" icon={<KeyRound size={15} />} loading={mutation.isPending} disabled={!valid || mutation.isPending}>Ubah Password</Button>
      </form>
    </SectionCard>
  );
};

export const PengaturanPage = () => {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <PageHeader title="Pengaturan" description="Profil aplikasi, akun, dan keamanan sesi" />

      <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/10 px-4 py-3 text-[12px] font-semibold text-ink-soft flex items-center gap-2.5">
        <Settings2 size={16} className="text-accent-amber shrink-0" />
        Profil showroom, notifikasi, dan tema masih bersifat baca-saja. Password akun dapat diubah melalui kartu keamanan di bawah.
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

        <div className="lg:col-span-2">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
};
