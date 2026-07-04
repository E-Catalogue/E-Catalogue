import { createFileRoute } from '@tanstack/react-router';
import { ContactInboxPage } from '@/features/cms/ContactInboxPage';

export const Route = createFileRoute('/_admin/cms/kontak')({
  component: ContactInboxPage,
});
