import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type GlobalErrorType =
  | 'general'
  | 'network'
  | 'timeout'
  | 'server'
  | 'maintenance'
  | 'parsing'
  | 'auth';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastState {
  isOpen: boolean;
  title: string;
  message: string;
  type: GlobalErrorType;
  /** Menentukan ikon & warna. Bila kosong, diturunkan dari title/type di komponen. */
  variant?: ToastVariant;
}

interface UiState {
  toast: ToastState;
}

const initialState: UiState = {
  toast: {
    isOpen: false,
    title: '',
    message: '',
    type: 'general',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<Omit<ToastState, 'isOpen'>>) => {
      state.toast = { isOpen: true, ...action.payload };
    },
    hideToast: (state) => {
      state.toast.isOpen = false;
    },
  },
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
