import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { GlobalErrorModal } from '@/shared/components/GlobalErrorModal';

interface MyRouterContext {
  isAuthenticated: boolean;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <GlobalErrorModal />
    </>
  ),
});