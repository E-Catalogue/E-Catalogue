import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type GlobalErrorType =
  | 'general'
  | 'network'
  | 'timeout'
  | 'server'
  | 'maintenance'
  | 'parsing'
  | 'auth';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ShowToastPayload {
  title: string;
  message: string;
  type?: GlobalErrorType;
  /** Menentukan ikon & warna, dan ke mana notifikasi dirutekan. Bila kosong, diturunkan dari title/type. */
  variant?: ToastVariant;
}

interface ErrorModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: GlobalErrorType;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  variant: 'success' | 'info' | 'warning';
}

interface UiState {
  /** Error/peringatan infra — tetap modal (butuh perhatian eksplisit dari user). */
  errorModal: ErrorModalState;
  /** Sukses/info/warning ringan — non-blocking, auto-dismiss (lihat ToastStack). */
  toasts: ToastItem[];
}

const initialState: UiState = {
  errorModal: { isOpen: false, title: '', message: '', type: 'general' },
  toasts: [],
};

/** Sama seperti heuristik lama GlobalErrorModal: variant eksplisit menang, selain itu ditebak dari type/title. */
const resolveVariant = (payload: ShowToastPayload): ToastVariant => {
  if (payload.variant) return payload.variant;
  if ((payload.type ?? 'general') !== 'general') return 'error';
  const t = payload.title.toLowerCase();
  if (t.startsWith('berhasil') || t.startsWith('sukses')) return 'success';
  if (t.startsWith('gagal') || t.startsWith('error')) return 'error';
  return 'info';
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * Satu pintu untuk semua notifikasi. Error (infra atau variant eksplisit `error`) tetap
     * memakai modal blocking (GlobalErrorModal) karena butuh acknowledgement eksplisit —
     * selain itu masuk ke ToastStack (non-blocking, auto-dismiss).
     */
    showToast: (state, action: PayloadAction<ShowToastPayload>) => {
      const { title, message, type = 'general' } = action.payload;
      const variant = resolveVariant(action.payload);
      if (variant === 'error') {
        state.errorModal = { isOpen: true, title, message, type };
      } else {
        state.toasts.push({ id: crypto.randomUUID(), title, message, variant });
      }
    },
    hideToast: (state) => {
      state.errorModal.isOpen = false;
    },
    removeToastItem: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { showToast, hideToast, removeToastItem } = uiSlice.actions;
export default uiSlice.reducer;
