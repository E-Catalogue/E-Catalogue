import { createFileRoute } from '@tanstack/react-router';
import { FeatureUnavailablePage } from '@/features/auth/StatePages';

export const Route = createFileRoute('/feature-unavailable')({
  component: FeatureUnavailablePage,
});
