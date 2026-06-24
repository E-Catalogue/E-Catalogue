import { createRouter } from '@tanstack/react-router';
import { routeTree } from '../../routeTree.gen';

// 1. Definisikan tipe Context agar TypeScript tidak error
export interface RouterContext {
  isAuthenticated: boolean;
}

// 2. Buat instance router
export const router = createRouter({
  routeTree,
  context: {
    // Memberikan nilai default, nanti akan di-override (ditimpa) secara dinamis oleh RouterProvider di main.tsx
    isAuthenticated: false, 
  } satisfies RouterContext,
});

// 3. Daftarkan tipe router untuk Type Safety global
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}