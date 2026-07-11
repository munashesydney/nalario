"use client";

import { useState, useEffect, useCallback } from "react";
import { useCanvasStore } from "../../lib/store/canvas-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseMarqueeSelectionReturn {
  /** Whether a marquee drag is in progress */
  isSelecting: boolean;
  /** Start point of the selection rectangle (canvas-space) */
  selectionStart: { x: number; y: number };
  /** Current end point of the selection rectangle (canvas-space) */
  selectionEnd: { x: number; y: number };
  /** Call this from the canvas element's onMouseDown */
  handleCanvasMouseDown: (e: React.MouseEvent) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clientToCanvas(
  clientX: number,
  clientY: number,
  canvas: HTMLElement,
  canvasWidth: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const s = canvasWidth / rect.width;
  return {
    x: (clientX - rect.left) * s,
    y: (clientY - rect.top) * s,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Handles marquee (rubber-band) selection on the canvas surface.
 * - When clicking with the "select" or "image" tool, starts a selection box
 * - With other active tools, places an element instead
 * - On mouse up, computes which elements intersect the selection rectangle
 */
export function useMarqueeSelection(
  canvasRef: React.RefObject<HTMLDivElement | null>,
): UseMarqueeSelectionReturn {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });

  // We pull these from the store imperatively inside handlers to keep deps sane
  const activeTool = useCanvasStore((s) => s.activeTool);
  const canvasWidth = useCanvasStore((s) => s.canvasWidth);
  const canvasHeight = useCanvasStore((s) => s.canvasHeight);
  const elements = useCanvasStore((s) => s.elements);

  // ---- Mouse down on canvas -----------------------------------------------

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const canvas = canvasRef.current;
      if (!canvas || e.target !== canvas) return;

      const state = useCanvasStore.getState();

      // Non-select tools → place an element
      if (state.activeTool !== "select" && state.activeTool !== "image") {
        state.deselectAll();
        const pos = clientToCanvas(e.clientX, e.clientY, canvas, state.canvasWidth);
        state.addElement(state.activeTool, { x: pos.x - 75, y: pos.y - 40 });
        return;
      }

      // Select / image tool → start marquee
      const start = clientToCanvas(e.clientX, e.clientY, canvas, state.canvasWidth);
      setIsSelecting(true);
      setSelectionStart(start);
      setSelectionEnd(start);
    },
    [canvasRef],
  );

  // ---- Mouse move / up (registered on window while selecting) -------------

  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const pos = clientToCanvas(e.clientX, e.clientY, canvas, canvasWidth);

      setSelectionEnd({
        x: Math.max(0, Math.min(pos.x, canvasWidth)),
        y: Math.max(0, Math.min(pos.y, canvasHeight)),
      });
    };

    const handleMouseUp = () => {
      setIsSelecting(false);

      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);

      const state = useCanvasStore.getState();

      // Only count if they dragged more than 5 px
      if (maxX - minX > 5 || maxY - minY > 5) {
        const selected = state.elements.filter((el) => {
          const elMinX = el.position.x;
          const elMaxX = el.position.x + el.dimensions.width;
          const elMinY = el.position.y;
          const elMaxY = el.position.y + el.dimensions.height;

          return !(
            maxX < elMinX ||
            minX > elMaxX ||
            maxY < elMinY ||
            minY > elMaxY
          );
        });

        if (selected.length > 0) {
          state.setMultiSelectedIds(selected.map((s) => s.id));
        } else {
          state.deselectAll();
        }
      } else {
        // Just a click
        if (state.activeTool === "select") {
          state.selectElement("canvas-background");
        } else {
          state.deselectAll();
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // We intentionally capture selectionStart/End at snapshot time (when
    // isSelecting flips to true) rather than in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelecting, canvasRef, canvasWidth, canvasHeight, elements]);

  return {
    isSelecting,
    selectionStart,
    selectionEnd,
    handleCanvasMouseDown,
  };
}
