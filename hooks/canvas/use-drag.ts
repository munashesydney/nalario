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
      let snapXDashed = false;
      let minDistX = SNAP_THRESHOLD;

      let snapY: number | null = null;
      let snapLineY: number | null = null;
      let snapYDashed = false;
      let minDistY = SNAP_THRESHOLD;

      // Edge index arrays — same index = same edge type = solid
      //                                different index = cross alignment = dashed
      const eXEdges = [newX, newX + actualWidth / 2, newX + actualWidth];
      const eYEdges = [newY, newY + actualHeight / 2, newY + actualHeight];

      // 1. Element-to-element snapping
      const otherElements = useCanvasStore
        .getState()
        .elements.filter((el) => el.id !== element.id);

      for (const other of otherElements) {
        const oXEdges = [
          other.position.x,
          other.position.x + other.dimensions.width / 2,
          other.position.x + other.dimensions.width,
        ];
        const oYEdges = [
          other.position.y,
          other.position.y + other.dimensions.height / 2,
          other.position.y + other.dimensions.height,
        ];

        // X-axis: 3×3 combinations
        for (let ei = 0; ei < 3; ei++) {
          for (let oi = 0; oi < 3; oi++) {
            const dist = Math.abs(eXEdges[ei] - oXEdges[oi]);
            if (dist < minDistX) {
              minDistX = dist;
              snapX = newX + (oXEdges[oi] - eXEdges[ei]);
              snapLineX = oXEdges[oi];
              // Same edge index = solid (left↔left, center↔center, right↔right)
              snapXDashed = ei !== oi;
            }
          }
        }

        // Y-axis: 3×3 combinations
        for (let ei = 0; ei < 3; ei++) {
          for (let oi = 0; oi < 3; oi++) {
            const dist = Math.abs(eYEdges[ei] - oYEdges[oi]);
            if (dist < minDistY) {
              minDistY = dist;
              snapY = newY + (oYEdges[oi] - eYEdges[ei]);
              snapLineY = oYEdges[oi];
              snapYDashed = ei !== oi;
            }
          }
        }
      }

      // 2. Canvas-level snapping (center + padding)
      const centerX = canvasBounds.width / 2;
      const elementCenterX = newX + actualWidth / 2;

      // Center X — dashed (it's a midpoint relationship, not an edge match)
      {
        const dist = Math.abs(elementCenterX - centerX);
        if (dist < minDistX) {
          minDistX = dist;
          snapX = centerX - actualWidth / 2;
          snapLineX = centerX;
          snapXDashed = true;
        }
      }
      // Left padding — solid (edge-to-edge with canvas boundary)
      {
        const dist = Math.abs(newX - PADDING);
        if (dist < minDistX) {
          minDistX = dist;
          snapX = PADDING;
          snapLineX = PADDING;
          snapXDashed = false;
        }
      }
      // Right padding — solid
      {
        const dist = Math.abs(newX + actualWidth - (canvasBounds.width - PADDING));
        if (dist < minDistX) {
          minDistX = dist;
          snapX = canvasBounds.width - PADDING - actualWidth;
          snapLineX = canvasBounds.width - PADDING;
          snapXDashed = false;
        }
      }

      const centerY = canvasBounds.height / 2;
      const elementCenterY = newY + actualHeight / 2;

      // Center Y — dashed
      {
        const dist = Math.abs(elementCenterY - centerY);
        if (dist < minDistY) {
          minDistY = dist;
          snapY = centerY - actualHeight / 2;
          snapLineY = centerY;
          snapYDashed = true;
        }
      }
      // Top padding — solid
      {
        const dist = Math.abs(newY - PADDING);
        if (dist < minDistY) {
          minDistY = dist;
          snapY = PADDING;
          snapLineY = PADDING;
          snapYDashed = false;
        }
      }
      // Bottom padding — solid
      {
        const dist = Math.abs(newY + actualHeight - (canvasBounds.height - PADDING));
        if (dist < minDistY) {
          minDistY = dist;
          snapY = canvasBounds.height - PADDING - actualHeight;
          snapLineY = canvasBounds.height - PADDING;
          snapYDashed = false;
        }
      }

      // 3. Apply closest snaps
      if (snapX !== null) {
        newX = snapX;
        activeSnaps.push({ axis: "x", value: snapLineX!, dashed: snapXDashed });
      }
      if (snapY !== null) {
        newY = snapY;
        activeSnaps.push({ axis: "y", value: snapLineY!, dashed: snapYDashed });
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
