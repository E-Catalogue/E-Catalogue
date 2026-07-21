import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store';
import { queryClient } from '../queryClient';
import { AuthBootstrap } from './AuthBootstrap';
import { GlobalErrorModal } from '@/shared/components/ui/GlobalErrorModal';
import { ToastStack } from '@/shared/components/ui/ToastStack';
import { ConfirmedActionProvider } from '@/shared/components/ui/ConfirmedActionProvider';
import '@/core/api/interceptor';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          <ConfirmedActionProvider>
            {children}
            <GlobalErrorModal />
            <ToastStack />
          </ConfirmedActionProvider>
        </AuthBootstrap>
      </QueryClientProvider>
    </Provider>
  );
};
