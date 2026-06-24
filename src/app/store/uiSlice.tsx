import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GlobalErrorType } from '@/core/api/errorHandler';

interface ErrorModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: GlobalErrorType;
}

interface UiState {
  globalErrorModal: ErrorModalState;
}

const initialState: UiState = {
  globalErrorModal: {
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
    showGlobalError: (
      state,
      action: PayloadAction<Omit<ErrorModalState, 'isOpen'>>
    ) => {
      state.globalErrorModal = {
        isOpen: true,
        ...action.payload,
      };
    },
    hideGlobalError: (state) => {
      state.globalErrorModal.isOpen = false;
    },
  },
});

export const { showGlobalError, hideGlobalError } = uiSlice.actions;
export default uiSlice.reducer;