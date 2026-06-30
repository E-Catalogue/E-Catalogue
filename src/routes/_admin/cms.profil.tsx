import { createFileRoute } from '@tanstack/react-router';
import { ProfilPage } from '@/features/cms/ProfilPage';

export const Route = createFileRoute('/_admin/cms/profil')({
  component: ProfilPage,
});
