import { useEffect, type ReactNode } from 'react';
import { useAppDispatch } from '@/app/store';
import { setSession, setHydrating, clearCredentials } from '@/app/store/authSlice';
import { authApi } from '@/features/auth/auth.api';
import { getAccessToken } from '@/core/api/token';

/** Hidrasi sesi saat app dimuat: jika ada token, ambil profil dari /auth/me. */
export const AuthBootstrap = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;
    if (!getAccessToken()) {
      dispatch(setHydrating(false));
      return;
    }
    dispatch(setHydrating(true));
    authApi
      .me()
      .then((me) => active && dispatch(setSession(me)))
      .catch(() => {
        // Interceptor sudah mencoba refresh; bila tetap gagal, bersihkan sesi.
        if (active) dispatch(clearCredentials());
      });
    return () => {
      active = false;
    };
  }, [dispatch]);

  return <>{children}</>;
};
