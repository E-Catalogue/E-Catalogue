import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { KeyRound, MailCheck, Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { tenantAuthApi } from '@/features/tenant/api/tenant-auth.api';
import { getApiErrorMessage } from '@/core/api/apiError';
import { APP_NAME } from '@/shared/constants';

/** Kerangka kartu untuk halaman auth sekunder (forgot / reset / change password). */
const AuthCard = ({
  icon,
  title,
  subtitle,
  children,
  footer,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
    <div className="w-full max-w-sm">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
        {APP_NAME}
      </p>

      <div className="bg-surface border border-border rounded-2xl shadow-card p-6 sm:p-7">
        <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-5">
          {icon}
        </div>
        <h1 className="text-xl font-extrabold text-ink">{title}</h1>
        <p className="text-muted font-medium mt-1.5 text-[13px] leading-relaxed">{subtitle}</p>

        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-5 text-center">{footer}</div>}
    </div>
  </div>
);

const Alert = ({ kind, message }: { kind: 'error' | 'success'; message: string }) => (
  <div
    role="alert"
    className={`flex items-start gap-2 mb-4 px-3.5 py-2.5 rounded-xl border ${
      kind === 'error'
        ? 'bg-semantic-error/10 border-semantic-error/20 text-semantic-error'
        : 'bg-accent-green/10 border-accent-green/20 text-accent-green'
    }`}
  >
    {kind === 'error' ? (
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
    ) : (
      <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
    )}
    <p className="text-[12px] font-semibold leading-snug">{message}</p>
  </div>
);

const backToLogin = (
  <Link to="/login" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-muted hover:text-primary">
    <ArrowLeft size={14} /> Kembali ke login
  </Link>
);

// ── Forgot Password ───────────────────────────────────────────────────────────

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO(api): endpoint forgot-password belum ada di PRD tenant auth.
    // Saat tersedia: await tenantAuthApi.forgotPassword({ email }).
    setSent(true);
  };

  return (
    <AuthCard
      icon={<MailCheck size={24} strokeWidth={2.2} />}
      title="Lupa Password"
      subtitle="Masukkan email Anda. Kami akan mengirim tautan untuk membuat password baru."
      footer={backToLogin}
    >
      {sent ? (
        <Alert kind="success" message={`Bila ${email} terdaftar, tautan reset sudah dikirim ke email tersebut.`} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@acme.test"
          />
          <Button type="submit" block className="h-11">
            Kirim Tautan Reset
          </Button>
        </form>
      )}
    </AuthCard>
  );
};

// ── Reset Password ────────────────────────────────────────────────────────────

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Konfirmasi password tidak sama.');
      return;
    }
    // TODO(api): endpoint reset-password belum ada di PRD tenant auth.
    setDone(true);
  };

  return (
    <AuthCard
      icon={<Lock size={24} strokeWidth={2.2} />}
      title="Password Baru"
      subtitle="Buat password baru untuk akun Anda."
      footer={backToLogin}
    >
      {done ? (
        <Alert kind="success" message="Password berhasil diubah. Silakan masuk dengan password baru." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert kind="error" message={error} />}
          <TextField
            label="Password Baru"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            helperText="Minimal 8 karakter."
          />
          <TextField
            label="Ulangi Password"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
          <Button type="submit" block className="h-11">
            Simpan Password
          </Button>
        </form>
      )}
    </AuthCard>
  );
};

// ── Change Password ───────────────────────────────────────────────────────────

/**
 * Dipakai saat `mustChangePassword = true` (lihat PRD tenant auth).
 * Endpoint-nya SUDAH ADA: POST /tenant/auth/change-password.
 */
export const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirm) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setLoading(true);
    try {
      await tenantAuthApi.changePassword({ currentPassword, newPassword });
      navigate({ to: '/' });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mengganti password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      icon={<KeyRound size={24} strokeWidth={2.2} />}
      title="Ganti Password"
      subtitle="Password Anda bersifat sementara. Buat password baru sebelum melanjutkan."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert kind="error" message={error} />}
        <TextField
          label="Password Saat Ini"
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
        />
        <TextField
          label="Password Baru"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          helperText="Minimal 8 karakter."
        />
        <TextField
          label="Ulangi Password Baru"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
        />
        <Button
          type="submit"
          block
          disabled={loading}
          icon={loading ? <Loader2 size={16} className="animate-spin" /> : undefined}
          className="h-11"
        >
          {loading ? 'Menyimpan...' : 'Simpan Password'}
        </Button>
      </form>
    </AuthCard>
  );
};
