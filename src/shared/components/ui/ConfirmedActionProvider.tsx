import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { registerTransportConfirmation, type TransportConfirmationRequest } from '@/core/api/mutationConfirmation';

type ConfirmTone = 'danger' | 'warning' | 'primary';

export interface ConfirmedActionOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  execute: () => Promise<unknown>;
  onSuccess?: () => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
}

type ConfirmAction = (options: ConfirmedActionOptions) => void;

const ConfirmedActionContext = createContext<ConfirmAction | null>(null);

export const ConfirmedActionProvider = ({ children }: { children: ReactNode }) => {
  const [pendingAction, setPendingAction] = useState<ConfirmedActionOptions | null>(null);
  const [running, setRunning] = useState(false);
  const [transportRequest, setTransportRequest] = useState<(TransportConfirmationRequest & { resolve: (approved: boolean) => void }) | null>(null);
  const runningRef = useRef(false);

  const request = useCallback<ConfirmAction>((options) => {
    if (runningRef.current) return;
    setPendingAction({ ...options });
  }, []);

  const close = useCallback(() => {
    if (!runningRef.current) setPendingAction(null);
  }, []);

  const run = useCallback(async () => {
    if (!pendingAction || runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    try {
      await pendingAction.execute();
      await pendingAction.onSuccess?.();
      setPendingAction(null);
    } catch (error) {
      setPendingAction(null);
      await pendingAction.onError?.(error);
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  }, [pendingAction]);

  const value = useMemo(() => request, [request]);

  useEffect(() => {
    registerTransportConfirmation((next) => new Promise<boolean>((resolve) => {
      setTransportRequest({ ...next, resolve });
    }));
    return () => registerTransportConfirmation(null);
  }, []);

  return (
    <ConfirmedActionContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={!!pendingAction}
        onClose={close}
        onConfirm={run}
        title={pendingAction?.title}
        message={pendingAction?.message}
        confirmLabel={pendingAction?.confirmLabel ?? 'Lanjutkan'}
        cancelLabel={pendingAction?.cancelLabel}
        tone={pendingAction?.tone ?? 'primary'}
        loading={running}
        closeOnConfirm={false}
      />
      <ConfirmDialog
        open={!!transportRequest}
        onClose={() => {
          transportRequest?.resolve(false);
          setTransportRequest(null);
        }}
        onConfirm={() => {
          transportRequest?.resolve(true);
          setTransportRequest(null);
        }}
        title={transportRequest?.title}
        message={transportRequest?.message}
        confirmLabel={transportRequest?.confirmLabel}
        tone="primary"
      />
    </ConfirmedActionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirmedAction = () => {
  const value = useContext(ConfirmedActionContext);
  if (!value) throw new Error('useConfirmedAction harus digunakan di dalam ConfirmedActionProvider');
  return value;
};
