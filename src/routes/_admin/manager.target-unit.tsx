import { createFileRoute } from '@tanstack/react-router';
import { ManagerTargetUnitPage } from '@/features/manager/ManagerTargetUnitPage';

export const Route = createFileRoute('/_admin/manager/target-unit')({ component: ManagerTargetUnitPage });
