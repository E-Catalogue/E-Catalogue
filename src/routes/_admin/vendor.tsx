import { createFileRoute } from '@tanstack/react-router';
import { VendorPage } from '@/features/master/VendorPage';

export const Route = createFileRoute('/_admin/vendor')({
  component: VendorPage,
});
