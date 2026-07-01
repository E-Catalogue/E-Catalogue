import { createFileRoute } from '@tanstack/react-router';
import { FallbackPage } from '@/features/errors/FallbackPage';

// `$.tsx` = splat/catch-all wajib TanStack Router: menangkap semua path admin
// yang tidak cocok. Nama file tidak boleh diubah (lihat FallbackPage untuk isinya).
export const Route = createFileRoute('/_admin/$')({
  component: FallbackPage,
});
