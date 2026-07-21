import { MutationCache, QueryClient } from '@tanstack/react-query';
import { store } from './store';
import { showToast } from './store/uiSlice';

let client: QueryClient;

const mutationCache = new MutationCache({
  onSettled: async (_data, error, _variables, _context, mutation) => {
    if (error || mutation.meta?.skipGlobalRefresh) return;
    try {
      // Hook domain tetap menentukan query mana yang stale. Lapisan ini memastikan semua
      // refetch aktif selesai sebelum mutation dianggap tuntas dan modal boleh ditutup.
      await client.refetchQueries({ type: 'active', stale: true }, { throwOnError: true });
    } catch {
      store.dispatch(showToast({
        title: 'Data belum diperbarui',
        message: 'Aksi sudah tersimpan, tetapi tampilan gagal dimuat ulang.',
        variant: 'warning',
        action: { label: 'Muat Ulang', type: 'reload-page' },
      }));
    }
  },
});

// Singleton agar bisa dibersihkan dari luar React (mis. saat sesi berakhir).
export const queryClient = client = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
