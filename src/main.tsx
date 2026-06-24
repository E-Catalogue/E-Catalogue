import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { useSelector } from 'react-redux';

import { AppProvider } from '@/app/providers';
import { router } from '@/app/router'; 
import type { RootState } from '@/app/store';

import '@/core/api/interceptor'; 
import './index.css';

function InnerApp() {
  // Ambil state autentikasi secara reaktif
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // KUNCI PERBAIKAN: Setiap kali Redux berubah, secara paksa update context router bawaan
  useEffect(() => {
    router.update({
      context: {
        isAuthenticated,
      },
    });
  }, [isAuthenticated]);

  return <RouterProvider router={router} context={{ isAuthenticated }} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <InnerApp />
    </AppProvider>
  </StrictMode>,
);