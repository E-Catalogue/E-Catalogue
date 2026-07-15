import { createFileRoute } from '@tanstack/react-router';
import { ForbiddenPage } from '@/features/auth/StatePages';

export const Route = createFileRoute('/forbidden')({
  component: ForbiddenPage,
});
