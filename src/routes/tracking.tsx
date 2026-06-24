import { createFileRoute } from '@tanstack/react-router'
import { TrackingPage } from '@/features/tracking/pages/TrackingPage'

export const Route = createFileRoute('/tracking')({
  component: TrackingPage,
})