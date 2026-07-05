"use client";

import React, { useRef, useEffect, useState } from "react";
import { CanvasElement } from "../../lib/types/canvas";
import { useCanvasStore } from "../../lib/store/canvas-store";
import { DraggableElement } from "./CanvasElement";
import { TextEditorSheet } from "./TextEditorSheet";
import { ShapeEditorSheet } from "./ShapeEditorSheet";
import { DesignSheet } from "../layout/DesignSheet";
import { HelpCircle } from "lucide-react";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  
  const {
    elements,
    selectedId,
    activeTool,
    selectElement,
    deselectAll,
    updateElement,
    deleteElement,
    addElement,
  } = useCanvasStore();

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      deselectAll();

      if (activeTool !== "select" && activeTool !== "image") {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scale = CANVAS_WIDTH / rect.width;
        const x = (e.clientX - rect.left) * scale;
        const y = (e.clientY - rect.top) * scale;

        addElement(activeTool, { x: x - 75, y: y - 40 });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        deleteElement(selectedId);
      }
      if (e.key === "Escape") {
        deselectAll();
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

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const padding = 64;
      const availableWidth = Math.max(1, width - padding);
      const availableHeight = Math.max(1, height - padding);
      
      const scaleX = availableWidth / CANVAS_WIDTH;
      const scaleY = availableHeight / CANVAS_HEIGHT;
      
      setScale(Math.max(0.1, Math.min(1, scaleX, scaleY)));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleElementUpdate =
    (id: string) => (updates: Partial<CanvasElement>) => {
      if (Object.keys(updates).length === 0 && selectedId === id) {
        deleteElement(id);
      } else {
        updateElement(id, updates);
      }
    };

  return (
    <>
      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full flex items-center justify-center overflow-hidden"
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
          <DesignSheet
            className="relative"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
            }}
          >
            <div
              ref={canvasRef}
              data-canvas
              onClick={handleCanvasClick}
              className="absolute inset-0"
            >
              {elements.map((element) => (
                <DraggableElement
                  key={element.id}
                  element={element}
                  isSelected={selectedId === element.id}
                  onSelect={() => selectElement(element.id)}
                  onUpdate={handleElementUpdate(element.id)}
                  canvasBounds={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
                />
              ))}

              {!elements.length && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 pointer-events-none">
                  <HelpCircle className="w-6 h-6 mb-2 text-zinc-300" />
                  <p className="text-sm font-medium text-zinc-500">Canvas is empty</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Use the toolbar or press T, R, I to add elements
                  </p>
                </div>
              )}
            </div>
          </DesignSheet>
        </div>
      </div>

      <TextEditorSheet />
      <ShapeEditorSheet />
    </>
  );
}
