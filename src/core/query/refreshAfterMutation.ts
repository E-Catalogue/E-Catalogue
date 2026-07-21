import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';

/**
 * Menandai cache stale lalu menunggu refetch query aktif. Kegagalan refresh tidak
 * mengubah mutation server yang sudah sukses menjadi seolah-olah gagal.
 */
export const refreshAfterMutation = async (queryClient: QueryClient, keys: QueryKey[]) => {
  try {
    await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey, refetchType: 'none' })));
    await Promise.all(keys.map((queryKey) => queryClient.refetchQueries(
      { queryKey, type: 'active' },
      { throwOnError: true },
    )));
    return true;
  } catch {
    store.dispatch(showToast({
      title: 'Data belum diperbarui',
      message: 'Aksi sudah tersimpan, tetapi tampilan gagal dimuat ulang.',
      variant: 'warning',
      action: { label: 'Muat Ulang', type: 'reload-page' },
    }));
    return false;
  }
};
