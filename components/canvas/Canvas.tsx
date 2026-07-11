"use client";

import React, { useRef, useState } from "react";
import { CanvasElement } from "../../lib/types/canvas";
import { useCanvasStore } from "../../lib/store/canvas-store";
import { DraggableElement } from "./CanvasElement";
import { SelectionChrome } from "./SelectionChrome";
import { FloatingToolbar } from "./FloatingToolbar";
import { DesignSheet } from "../layout/DesignSheet";
import { HelpCircle, ImageUp } from "lucide-react";
import {
  useCanvasScale,
  useCanvasKeyboard,
  useImageDrop,
  useMarqueeSelection,
} from "../../hooks/canvas";

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isHoveringBg, setIsHoveringBg] = useState(false);

  // ---- Store subscriptions ----
  const {
    elements,
    streamingElements,
    selectedId,
    activeTool,
    selectElement,
    deselectAll,
    updateElement,
    deleteElement,
    activeSnapLines,
    multiSelectedIds,
    setMultiSelectedIds,
    canvasWidth,
    canvasHeight,
    canvasBackgroundColor,
  } = useCanvasStore();
  const isDraggingElement = useCanvasStore((s) => s.isDraggingElement);

  // ---- Extracted behaviours ----
  const scale = useCanvasScale(containerRef, canvasWidth, canvasHeight);
  useCanvasKeyboard();

  const {
    isSelecting,
    selectionStart,
    selectionEnd,
    handleCanvasMouseDown,
  } = useMarqueeSelection(canvasRef);

  const {
    isDragOver,
    containerHandlers,
    dropZoneHandlers,
  } = useImageDrop(canvasRef, canvasWidth, canvasHeight);

  // ---- Element update wrapper ----
  const handleElementUpdate =
    (id: string) => (updates: Partial<CanvasElement>) => {
      if (Object.keys(updates).length === 0 && selectedId === id) {
        deleteElement(id);
      } else {
        updateElement(id, updates);
      }
    };

  // ---- Render ----
  return (
    <div
      className="flex-1 w-full h-full flex overflow-hidden"
      {...containerHandlers}
    >


      <div
        ref={containerRef}
        className="flex-1 h-full flex items-center justify-center relative overflow-hidden"
        {...dropZoneHandlers}
        onMouseDown={(e) => {
          // Clicking directly on the gray area outside the canvas deselects everything
          if (e.target === containerRef.current) {
            deselectAll();
          }
        }}
      >
        <div
          className="relative"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center",
          }}
        >
          <DesignSheet
            className="relative"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              backgroundColor: canvasBackgroundColor || "#ffffff",
            }}
          >
            {/* Background selection / hover border */}
            {!isDraggingElement &&
              (selectedId === "canvas-background" || isHoveringBg) && (
                <div
                  className={`absolute inset-0 pointer-events-none transition-colors ${
                    selectedId === "canvas-background"
                      ? "border-4 border-pink-500"
                      : "border-4 border-pink-300"
                  }`}
                />
              )}

            {/* Drag overlay — shows anywhere in the viewport */}
            {isDragOver && (
              <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
                <div className="absolute inset-0 bg-white/60" />
                <div className="absolute inset-3 border-[3px] border-dashed border-zinc-900" />
                <div className="relative bg-white border-4 border-zinc-900 shadow-[4px_4px_0px_rgba(24,24,27,1)] px-5 py-3 flex items-center gap-3">
                  <ImageUp className="w-5 h-5 text-zinc-900 stroke-[2.5]" />
                  <span className="text-xs font-bold uppercase text-zinc-900">
                    Drop to add
                  </span>
                </div>
              </div>
            )}

            <div
              ref={canvasRef}
              data-canvas
              onMouseDown={handleCanvasMouseDown}
              onMouseOver={(e) => {
                setIsHoveringBg(e.target === canvasRef.current);
              }}
              onMouseOut={(e) => {
                if (
                  !e.relatedTarget ||
                  !canvasRef.current?.contains(e.relatedTarget as Node)
                ) {
                  setIsHoveringBg(false);
                }
              }}
              {...dropZoneHandlers}
              className="absolute inset-0"
            >
              {[...elements, ...streamingElements].map((element) => {
                const isStreaming = streamingElements.some(
                  (s) => s.id === element.id,
                );
                return (
                  <DraggableElement
                    key={element.id}
                    element={element}
                    isSelected={selectedId === element.id}
                    isMultiSelected={multiSelectedIds.includes(element.id)}
                    onSelect={() => selectElement(element.id)}
                    onUpdate={handleElementUpdate(element.id)}
                    canvasBounds={{ width: canvasWidth, height: canvasHeight }}
                    isStreaming={isStreaming}
                  />
                );
              })}

              {!elements.length && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 pointer-events-none">
                  <HelpCircle className="w-6 h-6 mb-2 text-zinc-300" />
                  <p className="text-sm font-medium text-zinc-500">
                    Nalario is empty
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Use the toolbar or press T, R, I to add elements
                  </p>
                </div>
              )}
            </div>
          </DesignSheet>

          {/* Selection overlay — outside DesignSheet so handles are never clipped */}
          {selectedId && selectedId !== "canvas-background" &&
            (() => {
              const el = [...elements, ...streamingElements].find(
                (e) => e.id === selectedId,
              );
              if (!el) return null;
              return (
                <SelectionChrome
                  element={el}
                  canvasBounds={{ width: canvasWidth, height: canvasHeight }}
                />
              );
            })()}

          {/* Snap guides */}
          {activeSnapLines.map((line, idx) => {
            const isVertical = line.axis === "x";
            if (line.dashed) {
              return (
                <div
                  key={`snap-${idx}`}
                  className={`absolute pointer-events-none z-50 border-dashed border-pink-400/60 ${
                    isVertical ? "border-l" : "border-t"
                  }`}
                  style={{
                    [isVertical ? "left" : "top"]: line.value,
                    [isVertical ? "top" : "left"]: 0,
                    [isVertical ? "bottom" : "right"]: 0,
                  }}
                />
              );
            }
            return (
              <div
                key={`snap-${idx}`}
                className="absolute bg-pink-500 pointer-events-none z-50"
                style={
                  isVertical
                    ? { left: line.value, top: 0, bottom: 0, width: 1 }
                    : { top: line.value, left: 0, right: 0, height: 1 }
                }
              />
            );
          })}

          {/* Marquee selection box */}
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

          <FloatingToolbar scale={scale} />
        </div>
      </div>
    </div>
  );
}
