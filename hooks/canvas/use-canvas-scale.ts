"use client";

import { useState, useEffect } from "react";

/**
 * Tracks the container's available space and computes a scale factor
 * so the canvas fits within the viewport with 64px padding on each side.
 */
export function useCanvasScale(
  containerRef: React.RefObject<HTMLDivElement | null>,
  canvasWidth: number,
  canvasHeight: number,
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const padding = 64;
      const availableWidth = Math.max(1, width - padding);
      const availableHeight = Math.max(1, height - padding);

      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;

      setScale(Math.max(0.1, Math.min(1, scaleX, scaleY)));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [canvasWidth, canvasHeight, containerRef]);

  return scale;
}
