import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

interface AnchoredOverlayOptions {
  width?: number | 'trigger';
  minWidth?: number;
  estimatedHeight?: number;
  align?: 'start' | 'end';
  gap?: number;
  viewportPadding?: number;
}

export interface AnchoredOverlayPosition {
  position: 'fixed';
  top: number;
  left: number;
  width?: number;
  maxHeight: number;
}

/** Menjaga popover portal tetap menempel ke trigger, termasuk di dalam modal yang di-scroll. */
export function useAnchoredOverlay(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  options: AnchoredOverlayOptions = {},
) {
  const [style, setStyle] = useState<AnchoredOverlayPosition | null>(null);
  const { width, minWidth = 0, estimatedHeight = 320, align = 'start', gap = 6, viewportPadding = 8 } = options;

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const requestedWidth = width === 'trigger' ? rect.width : (width ?? rect.width);
    const resolvedWidth = Math.min(Math.max(requestedWidth, minWidth), viewportWidth - viewportPadding * 2);
    const measuredHeight = panelRef.current?.getBoundingClientRect().height || estimatedHeight;
    const spaceBelow = viewportHeight - rect.bottom - gap - viewportPadding;
    const spaceAbove = rect.top - gap - viewportPadding;
    const placeAbove = spaceBelow < Math.min(measuredHeight, 180) && spaceAbove > spaceBelow;
    const maxHeight = Math.max(96, placeAbove ? spaceAbove : spaceBelow);
    const desiredTop = placeAbove
      ? rect.top - gap - Math.min(measuredHeight, maxHeight)
      : rect.bottom + gap;
    const desiredLeft = align === 'end' ? rect.right - resolvedWidth : rect.left;
    const left = Math.min(Math.max(desiredLeft, viewportPadding), viewportWidth - resolvedWidth - viewportPadding);
    const top = Math.min(Math.max(desiredTop, viewportPadding), viewportHeight - viewportPadding - 48);
    const next: AnchoredOverlayPosition = { position: 'fixed', top, left, width: resolvedWidth, maxHeight };
    setStyle((current) => current
      && current.top === next.top && current.left === next.left && current.width === next.width && current.maxHeight === next.maxHeight
      ? current : next);
  }, [align, estimatedHeight, gap, minWidth, panelRef, triggerRef, viewportPadding, width]);

  useLayoutEffect(() => {
    if (!open) return;
    let frame = requestAnimationFrame(update);
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener('resize', schedule);
    document.addEventListener('scroll', schedule, true);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    if (triggerRef.current) observer?.observe(triggerRef.current);
    if (panelRef.current) observer?.observe(panelRef.current);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('scroll', schedule, true);
      observer?.disconnect();
    };
  }, [open, panelRef, triggerRef, update]);

  return style;
}
