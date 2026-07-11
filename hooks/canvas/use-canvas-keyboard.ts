"use client";

import { useEffect } from "react";
import { useCanvasStore } from "../../lib/store/canvas-store";

/**
 * Global keyboard shortcuts for the canvas:
 * - Delete/Backspace → remove selected element
 * - Escape → deselect all
 * - Cmd+Z / Cmd+Shift+Z → undo / redo
 * - V / T / R / I → switch active tool
 */
export function useCanvasKeyboard() {
  const selectedId = useCanvasStore((s) => s.selectedId);
  const deleteElement = useCanvasStore((s) => s.deleteElement);
  const deselectAll = useCanvasStore((s) => s.deselectAll);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedId &&
        selectedId !== "canvas-background"
      ) {
        deleteElement(selectedId);
      }
      if (e.key === "Escape") {
        deselectAll();
      }

      // Undo / Redo
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useCanvasStore.getState().undo();
      }
      if (isMod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        useCanvasStore.getState().redo();
      }

      // Tool shortcuts
      if (e.key === "v" || e.key === "V") {
        useCanvasStore.getState().setActiveTool("select");
      }
      if (e.key === "t" || e.key === "T") {
        useCanvasStore.getState().setActiveTool("text");
      }
      if (e.key === "r" || e.key === "R") {
        useCanvasStore.getState().setActiveTool("shape");
      }
      if (e.key === "i" || e.key === "I") {
        useCanvasStore.getState().setActiveTool("image");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, deleteElement, deselectAll]);
}
