"use client";
import { useRef } from "react";
import type { PointerEvent } from "react";

/** Horizontal photo gestures leave vertical scrolling and browser pinch zoom available. */
export function useImageSwipe(onSwipe: (direction: number) => void) {
  const start = useRef<{ id: number; x: number; y: number } | null>(null);
  const cancel = () => { start.current = null; };
  return {
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (!event.isPrimary) { cancel(); return; }
      if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
      start.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerUp(event: PointerEvent<HTMLDivElement>) {
      const origin = start.current;
      cancel();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      if (!origin || origin.id !== event.pointerId) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) onSwipe(dx < 0 ? 1 : -1);
    },
    onPointerCancel: cancel,
    onLostPointerCapture: cancel,
  };
}
