import { createFileRoute } from '@tanstack/react-router';
import { TargetPage } from '@/features/target/TargetPage';

export const Route = createFileRoute('/_admin/targets')({
  component: TargetPage,
});
