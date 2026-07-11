"use client";

import React, { useCallback } from "react";
import { RotateCw } from "lucide-react";
import { CanvasElement } from "../../lib/types/canvas";
import { useCanvasStore } from "../../lib/store/canvas-store";

type ResizeHandle = "tl" | "tr" | "bl" | "br" | "l" | "r";

const CORNERS: { pos: string; handle: ResizeHandle }[] = [
  { pos: "-top-1 -left-1", handle: "tl" },
  { pos: "-top-1 -right-1", handle: "tr" },
  { pos: "-bottom-1 -left-1", handle: "bl" },
  { pos: "-bottom-1 -right-1", handle: "br" },
];

const SIDES: { pos: string; handle: ResizeHandle; className: string }[] = [
  { pos: "top-1/2 -left-1.5 -translate-y-1/2", handle: "l", className: "w-1.5 h-4" },
  { pos: "top-1/2 -right-1.5 -translate-y-1/2", handle: "r", className: "w-1.5 h-4" },
];

const MIN_DIMS = { width: 40, height: 24 };

interface SelectionChromeProps {
  element: CanvasElement;
  canvasBounds: { width: number; height: number };
}

export function SelectionChrome({ element, canvasBounds }: SelectionChromeProps) {
  const isText = element.type === "text";
  const { x, y } = element.position;
  const { width, height } = element.dimensions;

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.stopPropagation();
      e.preventDefault();
      useCanvasStore.getState().pushHistory();

      const startMouse = { x: e.clientX, y: e.clientY };
      const startPos = { x: element.position.x, y: element.position.y };
      const startDims = { width: element.dimensions.width, height: element.dimensions.height };
      const startFontSize = element.style?.fontSize ?? 16;

      const handleMouseMove = (ev: MouseEvent) => {
        const canvas = document.querySelector("[data-canvas]");
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

        if (isText && handle !== "l" && handle !== "r") {
          const scaleX = newDims.width / startDims.width;
          const scaleY = newDims.height / startDims.height;
          const ratio = Math.abs(scaleX - 1) > Math.abs(scaleY - 1) ? scaleX : scaleY;

          newDims.width = startDims.width * ratio;
          newDims.height = startDims.height * ratio;

          if (handle === "tl" || handle === "bl") {
            newPos.x = startPos.x + (startDims.width - newDims.width);
          }
          if (handle === "tl" || handle === "tr") {
            newPos.y = startPos.y + (startDims.height - newDims.height);
          }
        }

        useCanvasStore.getState().updateElement(element.id, {
          position: newPos,
          dimensions: newDims,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [element, canvasBounds, isText],
  );

  const handleRotateStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      useCanvasStore.getState().pushHistory();

      const startMouse = { x: e.clientX, y: e.clientY };
      const el = element;
      const elementNode = document.querySelector(`[data-element-id="${element.id}"]`);
      if (!elementNode) return;

      const rect = elementNode.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const startAngle = Math.atan2(startMouse.y - cy, startMouse.x - cx);

      const handleMouseMove = (ev: MouseEvent) => {
        const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx);
        const delta = ((angle - startAngle) * 180) / Math.PI;
        useCanvasStore.getState().updateElement(el.id, {
          rotation: (el.rotation ?? 0) + delta,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [element],
  );

  return (
    <>
      {/* Selection border */}
      <div
        className="absolute pointer-events-none border-2 border-pink-500"
        style={{
          left: x - 2,
          top: y - 2,
          width: width + 4,
          height: height + 4,
        }}
      />

      {/* Rotation handle */}
      <div
        onMouseDown={handleRotateStart}
        className="absolute w-5 h-5 rounded-full bg-white border-2 border-pink-500 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
        style={{
          left: x + width / 2 - 10,
          top: y + height + 4,
        }}
      >
        <RotateCw className="w-2.5 h-2.5 text-pink-500" />
      </div>

      {/* Corner resize handles */}
      {CORNERS.map(({ pos, handle }) => (
        <div
          key={handle}
          onMouseDown={(e) => handleResizeStart(e, handle)}
          className="absolute w-2 h-2 bg-white border-2 border-pink-500"
          style={{
            left:
              handle.includes("l")
                ? x - 4
                : x + width - 4,
            top:
              handle.includes("t")
                ? y - 4
                : y + height - 4,
            cursor:
              handle === "tl" || handle === "br"
                ? "nwse-resize"
                : "nesw-resize",
          }}
        />
      ))}

      {/* Side resize handles for text */}
      {isText &&
        SIDES.map(({ handle, className }) => (
          <div
            key={handle}
            onMouseDown={(e) => handleResizeStart(e, handle)}
            className="absolute bg-white border-2 border-pink-500 rounded-full w-1.5 h-4"
            style={{
              left: handle === "l" ? x - 6 : x + width - 1,
              top: y + height / 2 - 8,
              cursor: "ew-resize",
            }}
          />
        ))}
    </>
  );
}
