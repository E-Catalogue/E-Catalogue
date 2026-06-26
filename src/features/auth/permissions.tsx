import type { ReactNode } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { usePermissions } from './usePermissions';

/** Render children hanya jika punya permission (code tunggal atau salah satu dari `any`). */
export const Can = ({ code, any, children }: { code?: string; any?: string[]; children: ReactNode }) => {
  const { can, canAny } = usePermissions();
  const ok = any ? canAny(...any) : code ? can(code) : true;
  return ok ? <>{children}</> : null;
};

/** Gate seluruh halaman berdasarkan permission READ. Menunggu hidrasi sesi dulu. */
export const RequirePermission = ({ code, children }: { code: string; children: ReactNode }) => {
  const { can } = usePermissions();
  const hydrating = useAppSelector((s) => s.auth.hydrating);

  if (hydrating) {
    return (
      <div className="flex items-center justify-center py-24 text-muted">
        <Loader2 size={26} className="animate-spin" />
      </div>
    );
  }

  if (!can(code)) {
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <div className="w-14 h-14 rounded-2xl bg-semantic-error/10 text-semantic-error flex items-center justify-center mx-auto mb-4">
          <Lock size={26} />
        </div>
        <h2 className="text-lg font-extrabold text-ink">Akses Ditolak</h2>
        <p className="text-muted font-medium mt-1.5 text-sm">Anda tidak memiliki izin untuk membuka halaman ini.</p>
      </div>
    );
  }

  return <>{children}</>;
};
