import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store';
import { queryClient } from '../queryClient';
import { GlobalErrorModal } from '@/shared/components/ui/GlobalErrorModal';
import { AuthBootstrap } from '@/features/auth/AuthBootstrap';
import '@/core/api/interceptor';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          {children}
        </AuthBootstrap>
        <GlobalErrorModal />
      </QueryClientProvider>
    </Provider>
  );
};
