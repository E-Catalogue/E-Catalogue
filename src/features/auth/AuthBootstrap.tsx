import { useEffect, useState, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { setSession, clearCredentials } from '@/app/store/authSlice';
import { tenantAuthApi } from '@/features/tenant/api/tenant-auth.api';
import { buildSession } from './session';

interface AuthBootstrapProps {
  children: ReactNode;
}

export const AuthBootstrap = ({ children }: AuthBootstrapProps) => {
  const dispatch = useAppDispatch();
  const { hydrating } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(hydrating);

  useEffect(() => {
    const initSession = async () => {
      if (!hydrating) {
        setLoading(false);
        return;
      }

      try {
        // Profil + menu diambil paralel; permission efektif ikut di /me.
        // Menu opsional — gagal memuatnya tidak boleh membuang sesi (lihat tenant-auth.api).
        const [me, menus] = await Promise.all([
          tenantAuthApi.getMe(),
          tenantAuthApi.getMenu().catch(() => []),
        ]);

        dispatch(setSession(buildSession(me, menus)));
      } catch {
        // Token tidak valid atau sesi berakhir
        dispatch(clearCredentials());
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [dispatch, hydrating]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-[13px] font-semibold text-muted animate-pulse">Memulihkan sesi...</p>
      </div>
    );
  }

  return <>{children}</>;
};
