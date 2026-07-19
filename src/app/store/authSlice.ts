import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, GroupMenu, AuthPayload, MePayload } from '@/features/auth/types';
import { getAccessToken, setTokens, clearTokens } from '@/core/api/token';

interface AuthState {
  user: AuthUser | null;
  permissionCodes: string[];
  groupMenus: GroupMenu[];
  isAuthenticated: boolean;
  hydrating: boolean;
}

const initialState: AuthState = {
  user: null,
  permissionCodes: [],
  groupMenus: [],
  isAuthenticated: !!getAccessToken(),
  hydrating: !!getAccessToken(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Setelah login / refresh berhasil (membawa token baru).
    setCredentials: (state, action: PayloadAction<AuthPayload>) => {
      const { accessToken, refreshToken, user, permissionCodes, groupMenus } = action.payload;
      setTokens(accessToken, refreshToken);
      state.user = user;
      state.permissionCodes = permissionCodes ?? [];
      state.groupMenus = groupMenus ?? [];
      state.isAuthenticated = true;
      state.hydrating = false;
    },
    // Setelah /auth/me (tanpa token baru).
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

export const { setCredentials, setSession, setHydrating, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
