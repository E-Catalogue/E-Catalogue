import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LoginResponseData } from '@/features/auth/schema';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: LoginResponseData['user'] | null;
  staffProfile: LoginResponseData['staffProfile'] | null;
  branch: any | null;
  isAuthenticated: boolean;
}

// Ambil token dari localStorage saat inisialisasi
const initialToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
const initialRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

const initialState: AuthState = {
  token: initialToken,
  refreshToken: initialRefreshToken,
  user: null,
  staffProfile: null,
  branch: null,
  isAuthenticated: !!initialToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Dipanggil saat login BERHASIL atau saat REFRESH TOKEN berhasil
    setCredentials: (
      state,
      action: PayloadAction<LoginResponseData>
    ) => {
      const { accessToken, refreshToken, user, staffProfile, branch } = action.payload;
      
      state.token = accessToken;
      state.refreshToken = refreshToken;
      
      // Update data user jika ada (saat refresh token biasanya data user juga dikirim ulang)
      if (user) state.user = user;
      if (staffProfile) state.staffProfile = staffProfile;
      if (branch) state.branch = branch;
      
      state.isAuthenticated = true;
      
      // Simpan ke local storage
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    },
    
    // Dipanggil saat logout atau refresh token gagal (expired total)
    clearCredentials: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.staffProfile = null;
      state.branch = null;
      state.isAuthenticated = false;
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;