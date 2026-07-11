"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CanvasElement as CanvasElementType } from "../../lib/types/canvas";
import { useCanvasStore, SnapLine } from "../../lib/store/canvas-store";

interface UseDragParams {
  element: CanvasElementType;
  canvasBounds: { width: number; height: number };
  elementRef: React.RefObject<HTMLDivElement | null>;
  isText: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElementType>) => void;
}

/**
 * Handles mouse-drag to reposition the element on the canvas.
 */
export function useDrag({
  element,
  canvasBounds,
  elementRef,
  isText,
  isEditing,
  onSelect,
  onUpdate,
}: UseDragParams) {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) return;
      e.stopPropagation();
      onSelect();
      setIsDragging(true);
      useCanvasStore.getState().pushHistory();

      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    },
    [isEditing, onSelect, elementRef],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = elementRef.current?.closest("[data-canvas]");
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const scale = canvasBounds.width / canvasRect.width;

      const actualWidth = isText
        ? (elementRef.current?.offsetWidth ?? element.dimensions.width)
        : element.dimensions.width;
      const actualHeight = isText
        ? (elementRef.current?.offsetHeight ?? element.dimensions.height)
        : element.dimensions.height;

      let newX = (e.clientX - canvasRect.left - dragOffset.current.x) * scale;
      let newY = (e.clientY - canvasRect.top - dragOffset.current.y) * scale;

      // Smart Guides & Snapping logic
      const SNAP_THRESHOLD = 8;
      const PADDING = 24;
      const activeSnaps: SnapLine[] = [];

      // ── Collect all snap candidates (nearest edge wins per axis) ──
      let snapX: number | null = null;
      let snapLineX: number | null = null;
      let minDistX = SNAP_THRESHOLD;

      let snapY: number | null = null;
      let snapLineY: number | null = null;
      let minDistY = SNAP_THRESHOLD;

      // 1. Element-to-element snapping
      const otherElements = useCanvasStore
        .getState()
        .elements.filter((el) => el.id !== element.id);

      const eLeft = newX;
      const eRight = newX + actualWidth;
      const eCenterX = eLeft + actualWidth / 2;
      const eTop = newY;
      const eBottom = newY + actualHeight;
      const eCenterY = eTop + actualHeight / 2;

      for (const other of otherElements) {
        const oLeft = other.position.x;
        const oRight = other.position.x + other.dimensions.width;
        const oCenterX = oLeft + other.dimensions.width / 2;
        const oTop = other.position.y;
        const oBottom = other.position.y + other.dimensions.height;
        const oCenterY = oTop + other.dimensions.height / 2;

        // X-axis: check all 9 combinations (3 dragged × 3 target)
        for (const eEdge of [eLeft, eCenterX, eRight]) {
          for (const oEdge of [oLeft, oCenterX, oRight]) {
            const dist = Math.abs(eEdge - oEdge);
            if (dist < minDistX) {
              minDistX = dist;
              snapX = newX + (oEdge - eEdge);
              snapLineX = oEdge;
            }
          }
        }

        // Y-axis: check all 9 combinations (3 dragged × 3 target)
        for (const eEdge of [eTop, eCenterY, eBottom]) {
          for (const oEdge of [oTop, oCenterY, oBottom]) {
            const dist = Math.abs(eEdge - oEdge);
            if (dist < minDistY) {
              minDistY = dist;
              snapY = newY + (oEdge - eEdge);
              snapLineY = oEdge;
            }
          }
        }
      }

      // 2. Canvas-level snapping (center + padding)
      const centerX = canvasBounds.width / 2;
      const elementCenterX = newX + actualWidth / 2;

      // Center X
      {
        const dist = Math.abs(elementCenterX - centerX);
        if (dist < minDistX) {
          minDistX = dist;
          snapX = centerX - actualWidth / 2;
          snapLineX = centerX;
        }
      }
      // Left padding
      {
        const dist = Math.abs(newX - PADDING);
        if (dist < minDistX) {
          minDistX = dist;
          snapX = PADDING;
          snapLineX = PADDING;
        }
      }
      // Right padding
      {
        const dist = Math.abs(newX + actualWidth - (canvasBounds.width - PADDING));
        if (dist < minDistX) {
          minDistX = dist;
          snapX = canvasBounds.width - PADDING - actualWidth;
          snapLineX = canvasBounds.width - PADDING;
        }
      }

      const centerY = canvasBounds.height / 2;
      const elementCenterY = newY + actualHeight / 2;

      // Center Y
      {
        const dist = Math.abs(elementCenterY - centerY);
        if (dist < minDistY) {
          minDistY = dist;
          snapY = centerY - actualHeight / 2;
          snapLineY = centerY;
        }
      }
      // Top padding
      {
        const dist = Math.abs(newY - PADDING);
        if (dist < minDistY) {
          minDistY = dist;
          snapY = PADDING;
          snapLineY = PADDING;
        }
      }
      // Bottom padding
      {
        const dist = Math.abs(newY + actualHeight - (canvasBounds.height - PADDING));
        if (dist < minDistY) {
          minDistY = dist;
          snapY = canvasBounds.height - PADDING - actualHeight;
          snapLineY = canvasBounds.height - PADDING;
        }
      }

      // 3. Apply closest snaps
      if (snapX !== null) {
        newX = snapX;
        activeSnaps.push({ axis: "x", value: snapLineX! });
      }
      if (snapY !== null) {
        newY = snapY;
        activeSnaps.push({ axis: "y", value: snapLineY! });
      }

      useCanvasStore.getState().setActiveSnapLines(activeSnaps);

      onUpdate({ position: { x: newX, y: newY } });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      useCanvasStore.getState().setActiveSnapLines([]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    canvasBounds,
    element.id,
    element.dimensions,
    isText,
    elementRef,
    onUpdate,
  ]);

  return { isDragging, handleMouseDown };
}
