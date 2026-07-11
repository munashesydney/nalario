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
      const SNAP_THRESHOLD = 5;
      const PADDING = 24;
      const activeSnaps: SnapLine[] = [];

      // X Snapping
      const centerX = canvasBounds.width / 2;
      const elementCenterX = newX + actualWidth / 2;
      
      // Check center X
      if (Math.abs(elementCenterX - centerX) < SNAP_THRESHOLD) {
        newX = centerX - actualWidth / 2;
        activeSnaps.push({ axis: "x", value: centerX });
      } 
      // Check left edge padding
      else if (Math.abs(newX - PADDING) < SNAP_THRESHOLD) {
        newX = PADDING;
        activeSnaps.push({ axis: "x", value: PADDING });
      }
      // Check right edge padding
      else if (Math.abs((newX + actualWidth) - (canvasBounds.width - PADDING)) < SNAP_THRESHOLD) {
        newX = canvasBounds.width - PADDING - actualWidth;
        activeSnaps.push({ axis: "x", value: canvasBounds.width - PADDING });
      }

      // Y Snapping
      const centerY = canvasBounds.height / 2;
      const elementCenterY = newY + actualHeight / 2;
      
      // Check center Y
      if (Math.abs(elementCenterY - centerY) < SNAP_THRESHOLD) {
        newY = centerY - actualHeight / 2;
        activeSnaps.push({ axis: "y", value: centerY });
      }
      // Check top edge padding
      else if (Math.abs(newY - PADDING) < SNAP_THRESHOLD) {
        newY = PADDING;
        activeSnaps.push({ axis: "y", value: PADDING });
      }
      // Check bottom edge padding
      else if (Math.abs((newY + actualHeight) - (canvasBounds.height - PADDING)) < SNAP_THRESHOLD) {
        newY = canvasBounds.height - PADDING - actualHeight;
        activeSnaps.push({ axis: "y", value: canvasBounds.height - PADDING });
      }

      useCanvasStore.getState().setActiveSnapLines(activeSnaps);

      newX = Math.max(0, Math.min(newX, canvasBounds.width - actualWidth));
      newY = Math.max(0, Math.min(newY, canvasBounds.height - actualHeight));

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
    element.dimensions,
    isText,
    elementRef,
    onUpdate,
  ]);

  return { isDragging, handleMouseDown };
}
