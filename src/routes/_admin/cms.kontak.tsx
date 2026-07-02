import { createFileRoute } from '@tanstack/react-router';
import { InboxPage } from '@/features/cms/InboxPage';

export const Route = createFileRoute('/_admin/cms/kontak')({
  component: InboxPage,
});
