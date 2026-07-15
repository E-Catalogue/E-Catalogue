import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, GroupMenu, MePayload } from '@/features/auth/types';
import { getAccessToken, setTokens, clearTokens } from '@/core/api/token';

interface AuthState {
  user: AuthUser | null;
  permissionCodes: string[];
  groupMenus: GroupMenu[];
  isAuthenticated: boolean;
  hydrating: boolean;
}

const hasToken = !!getAccessToken();

const initialState: AuthState = {
  user: null,
  permissionCodes: [],
  groupMenus: [],
  isAuthenticated: hasToken,
  hydrating: hasToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Setelah login / refresh berhasil (membawa access token baru). */
    setAccessToken: (state, action: PayloadAction<string>) => {
      setTokens(action.payload);
      state.isAuthenticated = true;
    },

    /** Setelah /tenant/auth/me + /tenant/auth/me/menu. */
    setSession: (state, action: PayloadAction<MePayload>) => {
      state.user = action.payload.user;
      state.permissionCodes = action.payload.permissionCodes ?? [];
      state.groupMenus = action.payload.groupMenus ?? [];
      state.isAuthenticated = true;
      state.hydrating = false;
    },

    setHydrating: (state, action: PayloadAction<boolean>) => {
      state.hydrating = action.payload;
    },

    clearCredentials: (state) => {
      clearTokens();
      state.user = null;
      state.permissionCodes = [];
      state.groupMenus = [];
      state.isAuthenticated = false;
      state.hydrating = false;
    },
  },
});

export const { setAccessToken, setSession, setHydrating, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
