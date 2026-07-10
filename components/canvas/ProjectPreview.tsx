import React from "react";
import { CanvasElement } from "../../lib/types/canvas";
import { ElementRenderer } from "./ElementRenderer";

interface ProjectPreviewProps {
  elements: CanvasElement[];
  width: number;
  height: number;
  backgroundColor?: string;
  className?: string;
}

export function ProjectPreview({
  elements,
  width,
  height,
  backgroundColor = "#ffffff",
  className = "",
}: ProjectPreviewProps) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 
          We use an SVG wrapper to natively handle aspect-ratio scaling (object-fit: contain).
          This guarantees the preview scales perfectly within its container without overflowing.
        */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-w-full max-h-full"
        >
          <foreignObject x="0" y="0" width={width} height={height}>
            <div
              className="w-full h-full relative"
              style={{ backgroundColor }}
            >
              {elements.map((element) => {
                if (!element.position || !element.dimensions) return null;
                return (
                  <div
                    key={element.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: element.position.x,
                      top: element.position.y,
                      width: element.dimensions.width,
                      height: element.dimensions.height,
                      transform: `rotate(${element.rotation ?? 0}deg)`,
                      transformOrigin: "center center",
                    }}
                  >
                    <ElementRenderer element={element} />
                  </div>
                );
              })}
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}
