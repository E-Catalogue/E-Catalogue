import { createFileRoute } from '@tanstack/react-router';
import { BookPage } from '@/features/book/BookPage';

export const Route = createFileRoute('/_admin/pembukuan')({
  component: BookPage,
});
