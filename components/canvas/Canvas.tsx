"use client";

import React, { useRef, useEffect, useState } from "react";
import { CanvasElement } from "../../lib/types/canvas";
import { useCanvasStore } from "../../lib/store/canvas-store";
import { DraggableElement } from "./CanvasElement";
import { FloatingToolbar } from "./FloatingToolbar";
import { DesignSheet } from "../layout/DesignSheet";
import { HelpCircle } from "lucide-react";

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [isHoveringBg, setIsHoveringBg] = useState(false);
  
  const {
    elements,
    selectedId,
    activeTool,
    selectElement,
    deselectAll,
    updateElement,
    deleteElement,
    addElement,
    activeSnapLines,
    setMultiSelectedIds,
    multiSelectedIds,
    canvasWidth,
    canvasHeight,
    canvasBackgroundColor,
  } = useCanvasStore();

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      if (activeTool !== "select" && activeTool !== "image") {
        deselectAll();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const s = canvasWidth / rect.width;
        const x = (e.clientX - rect.left) * s;
        const y = (e.clientY - rect.top) * s;

        addElement(activeTool, { x: x - 75, y: y - 40 });
        return;
      }

      // Start marquee selection
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const s = canvasWidth / rect.width;
      const x = (e.clientX - rect.left) * s;
      const y = (e.clientY - rect.top) * s;
      
      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionEnd({ x, y });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const s = canvasWidth / rect.width;
      const x = (e.clientX - rect.left) * s;
      const y = (e.clientY - rect.top) * s;
      
      setSelectionEnd({
        x: Math.max(0, Math.min(x, canvasWidth)),
        y: Math.max(0, Math.min(y, canvasHeight)),
      });
    };

    const handleMouseUp = () => {
      if (!isSelecting) return;
      setIsSelecting(false);

      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);

      // Only count as a selection if they actually dragged a bit (e.g., > 5px)
      if (maxX - minX > 5 || maxY - minY > 5) {
        const selected = elements.filter((el) => {
          const elMinX = el.position.x;
          const elMaxX = el.position.x + el.dimensions.width;
          const elMinY = el.position.y;
          const elMaxY = el.position.y + el.dimensions.height;

          // Check for intersection
          return !(
            maxX < elMinX ||
            minX > elMaxX ||
            maxY < elMinY ||
            minY > elMaxY
          );
        });

        if (selected.length > 0) {
          setMultiSelectedIds(selected.map((s) => s.id));
        } else {
          deselectAll();
        }
      } else {
        // Just a click on the canvas background
        if (activeTool === "select") {
          selectElement("canvas-background");
        } else {
          deselectAll();
        }
      }
    };

    if (isSelecting) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSelecting, selectionStart, selectionEnd, elements, setMultiSelectedIds, deselectAll]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && selectedId !== "canvas-background") {
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
      
      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;
      
      setScale(Math.max(0.1, Math.min(1, scaleX, scaleY)));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [canvasWidth, canvasHeight]);

  const handleElementUpdate =
    (id: string) => (updates: Partial<CanvasElement>) => {
      if (Object.keys(updates).length === 0 && selectedId === id) {
        deleteElement(id);
      } else {
        updateElement(id, updates);
      }
    };

  return (
    <div className="flex-1 w-full h-full flex overflow-hidden">
      <div 
        ref={containerRef} 
        className="flex-1 h-full flex items-center justify-center relative overflow-hidden"
      >
        <div className="relative" style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
          <DesignSheet
            className="relative"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              backgroundColor: canvasBackgroundColor || "#ffffff",
            }}
            onMouseEnter={() => setIsHoveringBg(true)}
            onMouseLeave={() => setIsHoveringBg(false)}
          >
            {/* Background Selection / Hover Border */}
            {(selectedId === "canvas-background" || isHoveringBg) && (
              <div 
                className={`absolute inset-0 pointer-events-none transition-colors ${
                  selectedId === "canvas-background" ? "border-4 border-pink-500" : "border-4 border-pink-300"
                }`} 
              />
            )}

            <div
              ref={canvasRef}
              data-canvas
              onMouseDown={handleCanvasMouseDown}
              className="absolute inset-0"
            >
              {elements.map((element) => (
                <DraggableElement
                  key={element.id}
                  element={element}
                  isSelected={selectedId === element.id}
                  isMultiSelected={multiSelectedIds.includes(element.id)}
                  onSelect={() => selectElement(element.id)}
                  onUpdate={handleElementUpdate(element.id)}
                  canvasBounds={{ width: canvasWidth, height: canvasHeight }}
                />
              ))}

              {/* Render Snap Guides */}
              {activeSnapLines.map((line, idx) => (
                <div
                  key={`snap-${idx}`}
                  className="absolute bg-pink-500 pointer-events-none z-50"
                  style={
                    line.axis === "x"
                      ? {
                          left: line.value,
                          top: 0,
                          bottom: 0,
                          width: 1,
                        }
                      : {
                          top: line.value,
                          left: 0,
                          right: 0,
                          height: 1,
                        }
                  }
                />
              ))}

              {/* Render Marquee Selection Box */}
              {isSelecting && (
                <div
                  className="absolute border border-pink-500 bg-pink-500/20 pointer-events-none z-50"
                  style={{
                    left: Math.min(selectionStart.x, selectionEnd.x),
                    top: Math.min(selectionStart.y, selectionEnd.y),
                    width: Math.abs(selectionEnd.x - selectionStart.x),
                    height: Math.abs(selectionEnd.y - selectionStart.y),
                  }}
                />
              )}

              {!elements.length && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 pointer-events-none">
                  <HelpCircle className="w-6 h-6 mb-2 text-zinc-300" />
                  <p className="text-sm font-medium text-zinc-500">Nalario is empty</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Use the toolbar or press T, R, I to add elements
                  </p>
                </div>
              )}
            </div>
          </DesignSheet>
          
          <FloatingToolbar scale={scale} />
        </div>
      </div>
    </div>
  );
}
