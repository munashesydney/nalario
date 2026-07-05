"use client";

import { useCallback } from "react";
import { CanvasElement as CanvasElementType } from "../../lib/types/canvas";

export type ResizeHandle = "tl" | "tr" | "bl" | "br";

interface UseResizeParams {
  element: CanvasElementType;
  canvasBounds: { width: number; height: number };
  elementRef: React.RefObject<HTMLDivElement | null>;
  onUpdate: (updates: Partial<CanvasElementType>) => void;
}

const MIN_DIMS = { width: 40, height: 24 };

/**
 * Corner-resize via direct event listeners (no effect-based
 * listener registration — avoids the ref-not-triggering-effects trap).
 */
export function useResize({
  element,
  canvasBounds,
  elementRef,
  onUpdate,
}: UseResizeParams) {
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.stopPropagation();
      e.preventDefault();

      const startMouse = { x: e.clientX, y: e.clientY };
      const startPos = { x: element.position.x, y: element.position.y };
      const startDims = {
        width: elementRef.current?.offsetWidth ?? element.dimensions.width,
        height: elementRef.current?.offsetHeight ?? element.dimensions.height,
      };
      const startFontSize = element.style?.fontSize ?? 16;

      const handleMouseMove = (ev: MouseEvent) => {
        const canvas = elementRef.current?.closest("[data-canvas]");
        if (!canvas) return;
        const canvasRect = canvas.getBoundingClientRect();
        const scale = canvasBounds.width / canvasRect.width;

        const dx = (ev.clientX - startMouse.x) / scale;
        const dy = (ev.clientY - startMouse.y) / scale;

        let newPos = { ...startPos };
        let newDims = { ...startDims };

        switch (handle) {
          case "tl":
            newPos.x = Math.max(0, startPos.x + dx);
            newPos.y = Math.max(0, startPos.y + dy);
            newDims.width = Math.max(MIN_DIMS.width, startDims.width - dx);
            newDims.height = Math.max(MIN_DIMS.height, startDims.height - dy);
            break;
          case "tr":
            newPos.y = Math.max(0, startPos.y + dy);
            newDims.width = Math.max(MIN_DIMS.width, startDims.width + dx);
            newDims.height = Math.max(MIN_DIMS.height, startDims.height - dy);
            break;
          case "bl":
            newPos.x = Math.max(0, startPos.x + dx);
            newDims.width = Math.max(MIN_DIMS.width, startDims.width - dx);
            newDims.height = Math.max(MIN_DIMS.height, startDims.height + dy);
            break;
          case "br":
            newDims.width = Math.max(MIN_DIMS.width, startDims.width + dx);
            newDims.height = Math.max(MIN_DIMS.height, startDims.height + dy);
            break;
        }

        let newStyle = element.style;

        if (element.type === "text") {
          const scaleX = newDims.width / startDims.width;
          const scaleY = newDims.height / startDims.height;
          // Use the scale that is changing more to determine the ratio
          const ratio = Math.abs(scaleX - 1) > Math.abs(scaleY - 1) ? scaleX : scaleY;
          
          newDims.width = startDims.width * ratio;
          newDims.height = startDims.height * ratio;

          // Re-adjust position based on the proportional dimensions
          if (handle === "tl" || handle === "bl") {
            newPos.x = startPos.x + (startDims.width - newDims.width);
          }
          if (handle === "tl" || handle === "tr") {
            newPos.y = startPos.y + (startDims.height - newDims.height);
          }

          if (startFontSize) {
            newStyle = {
              ...element.style,
              fontSize: Math.max(1, Math.round(startFontSize * ratio)),
            };
          }
        }

        newDims.width = Math.min(newDims.width, canvasBounds.width - newPos.x);
        newDims.height = Math.min(
          newDims.height,
          canvasBounds.height - newPos.y,
        );

        onUpdate({ position: newPos, dimensions: newDims, ...(newStyle && { style: newStyle }) });
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [element, canvasBounds, elementRef, onUpdate],
  );

  return { handleResizeStart };
}
