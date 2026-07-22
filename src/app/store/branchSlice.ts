import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Branch context GLOBAL (`.prd/frontend_owner_admin_branch_context_20260721.md` §5-6.2):
 * satu-satunya sumber kebenaran `selectedBranchId` untuk role global (OWNER/ADMIN). Sebelumnya
 * tiap halaman memegang state cabangnya sendiri (tidak sinkron antar-halaman). Sekarang disimpan
 * di Redux + localStorage sehingga pilihan cabang konsisten di seluruh aplikasi dan bertahan antar
 * reload. `null` = mode "semua cabang" (hanya valid untuk READ; mutation wajib cabang konkret).
 *
 * Untuk role non-global nilai ini diabaikan (mereka selalu terikat `user.branch.id`).
 */
const STORAGE_KEY = 'ecatalogue.selectedBranchId';

const readPersisted = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

interface BranchState {
  selectedBranchId: string | null;
}

const initialState: BranchState = {
  selectedBranchId: readPersisted(),
};

export const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setSelectedBranch: (state, action: PayloadAction<string | null>) => {
      state.selectedBranchId = action.payload;
      try {
        if (action.payload) localStorage.setItem(STORAGE_KEY, action.payload);
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* storage tidak tersedia — abaikan, state tetap di memori */
      }
    },
  },
});

export const { setSelectedBranch } = branchSlice.actions;
export default branchSlice.reducer;
