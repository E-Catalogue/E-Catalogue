import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import uiReducer from './uiSlice';
import authReducer from './authSlice';
import branchReducer from './branchSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    branch: branchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
