import { createFileRoute } from '@tanstack/react-router';
import { PricingPolicyPage } from '@/features/units/PricingPolicyPage';

export const Route = createFileRoute('/_admin/master/parameter-harga')({ component: PricingPolicyPage });
