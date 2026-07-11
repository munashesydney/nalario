"use client";

import { useState, useRef, useCallback } from "react";
import {
  uploadToR2,
  placeImageAt,
  getScaledDimensions,
} from "../../lib/services/image-service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseImageDropReturn {
  /** True when a file is being dragged over the viewport */
  isDragOver: boolean;
  /** Spread onto the outermost container div */
  containerHandlers: {
    onDragEnter: (e: React.DragEvent) => void;
  };
  /** Spread onto the drop target (the container wrapping the canvas) */
  dropZoneHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Drag-and-drop image upload onto the canvas.
 *
 * @param canvasRef  Ref to the canvas surface element (used for coordinate mapping)
 * @param canvasWidth / canvasHeight — logical canvas dimensions
 */
export function useImageDrop(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  canvasWidth: number,
  canvasHeight: number,
): UseImageDropReturn {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragEnterCounter = useRef(0);

  // ---- Coordinate mapping -------------------------------------------------

  const clientToCanvas = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const el = canvasRef.current;
      if (!el) return { x: canvasWidth / 2, y: canvasHeight / 2 };

      const rect = el.getBoundingClientRect();
      const s = canvasWidth / rect.width;
      return {
        x: (clientX - rect.left) * s,
        y: (clientY - rect.top) * s,
      };
    },
    [canvasWidth, canvasHeight, canvasRef],
  );

  // ---- Upload + place -----------------------------------------------------

  const handleDropFile = useCallback(
    async (file: File, clientX: number, clientY: number) => {
      if (!file.type.startsWith("image/")) return;

      try {
        const { url, objectKey } = await uploadToR2(file);

        const img = new Image();
        img.onload = () => {
          const dims = getScaledDimensions(img.naturalWidth, img.naturalHeight);
          const canvasPos = clientToCanvas(clientX, clientY);
          placeImageAt(url, objectKey, canvasPos.x, canvasPos.y, dims);
        };
        img.src = url;
      } catch (err) {
        console.error("Failed to upload dropped image:", err);
      }
    },
    [clientToCanvas],
  );

  // ---- Container-level handlers -------------------------------------------

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounter.current += 1;
    setIsDragOver(true);
  }, []);

  // ---- Drop-zone (wrapping the scaled canvas) handlers --------------------

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounter.current -= 1;
    if (dragEnterCounter.current <= 0) {
      dragEnterCounter.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragEnterCounter.current = 0;

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      await handleDropFile(file, e.clientX, e.clientY);
    },
    [handleDropFile],
  );

  return {
    isDragOver,
    containerHandlers: {
      onDragEnter: handleDragEnter,
    },
    dropZoneHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
