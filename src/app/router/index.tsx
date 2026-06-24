import { createRouter } from '@tanstack/react-router';
import { routeTree } from '../../routeTree.gen';

// Instance router. Login di-skip sementara, jadi tidak ada context auth.
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
