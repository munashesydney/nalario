"use client";

import { useCallback } from "react";
import { CanvasElement as CanvasElementType } from "../../lib/types/canvas";
import { useCanvasStore } from "../../lib/store/canvas-store";

export type ResizeHandle = "tl" | "tr" | "bl" | "br" | "l" | "r";

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
      useCanvasStore.getState().pushHistory();

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

        const dx = (ev.clientX - startMouse.x) * scale;
        const dy = (ev.clientY - startMouse.y) * scale;

        let newPos = { ...startPos };
        let newDims = { ...startDims };

        switch (handle) {
          case "tl":
            newPos.x = startPos.x + dx;
            newPos.y = startPos.y + dy;
            newDims.width = Math.max(MIN_DIMS.width, startDims.width - dx);
            newDims.height = Math.max(MIN_DIMS.height, startDims.height - dy);
            break;
          case "tr":
            newPos.y = startPos.y + dy;
            newDims.width = Math.max(MIN_DIMS.width, startDims.width + dx);
            newDims.height = Math.max(MIN_DIMS.height, startDims.height - dy);
            break;
          case "bl":
            newPos.x = startPos.x + dx;
            newDims.width = Math.max(MIN_DIMS.width, startDims.width - dx);
            newDims.height = Math.max(MIN_DIMS.height, startDims.height + dy);
            break;
          case "br":
            newDims.width = Math.max(MIN_DIMS.width, startDims.width + dx);
            newDims.height = Math.max(MIN_DIMS.height, startDims.height + dy);
            break;
          case "l":
            newPos.x = startPos.x + dx;
            newDims.width = Math.max(MIN_DIMS.width, startDims.width - dx);
            break;
          case "r":
            newDims.width = Math.max(MIN_DIMS.width, startDims.width + dx);
            break;
        }

        let newStyle = element.style;

        if (element.type === "text" && handle !== "l" && handle !== "r") {
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

        // No canvas bounds clamp — elements can resize freely beyond the canvas
        // (mirrors Canva/Figma behavior)

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
