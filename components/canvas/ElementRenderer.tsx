import React from "react";
import { CanvasElement } from "../../lib/types/canvas";
import { Image } from "lucide-react";
import { pointsToString, computePathViewBox } from "../../lib/services/shape-service";

interface ElementRendererProps {
  element: CanvasElement;
  isEditing?: boolean;
  editContent?: string;
}

export function ElementRenderer({ element, isEditing, editContent }: ElementRendererProps) {
  if (element.type === "group" && element.children) {
    return (
      <div className="w-full h-full relative pointer-events-none">
        {element.children.map((child) => (
          <div
            key={child.id}
            className="absolute"
            style={{
              left: child.position.x,
              top: child.position.y,
              width: child.dimensions.width,
              height: child.dimensions.height,
              transform: `rotate(${child.rotation ?? 0}deg)`,
              transformOrigin: "center center",
            }}
          >
            <ElementRenderer element={child} />
          </div>
        ))}
      </div>
    );
  }

  switch (element.type) {
    case "image":
      return (
        <div className="w-full h-full">
          {element.style?.src ? (
            <img
              src={element.style.src}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100">
              <Image className="w-6 h-6 text-zinc-400" />
            </div>
          )}
        </div>
      );

    case "text": {
      const vAlign = element.style?.verticalAlign || "top";
      const alignClass = 
        vAlign === "middle" ? "items-center" : 
        vAlign === "bottom" ? "items-end" : 
        "items-start";
      const isFixedSize = element.style?.textSizing === "fixed";

      // For read-only previews or non-editing states, we just render a div to perfectly match the layout
      return (
        <div
          className={`w-full ${isFixedSize ? "h-full" : "min-h-full"} flex ${alignClass} py-1 px-2 whitespace-pre-wrap break-words`}
          style={{
            backgroundColor: element.style?.backgroundColor || "transparent",
            fontSize: element.style?.fontSize,
            fontWeight: element.style?.fontWeight,
            fontFamily: element.style?.fontFamily,
            fontStyle: element.style?.fontStyle,
            textDecoration: element.style?.textDecoration,
            textAlign: element.style?.textAlign,
            color: element.style?.color,
            overflow: "hidden",
          }}
        >
          {isEditing ? editContent : element.content}
        </div>
      );
    }

    case "shape":
      return renderShape(element);
    
    default:
      return null;
  }
}

function renderShape(element: CanvasElement) {
  const kind = element.style?.shapeKind || "rectangle";
  const bg = element.style?.backgroundColor || "#3b82f6";
  const bw = element.style?.borderWidth || 0;
  const bc = element.style?.borderColor || "transparent";
  const br =
    kind === "circle" || kind === "ellipse"
      ? "50%"
      : element.style?.borderRadius;

  switch (kind) {
    case "circle":
    case "ellipse":
    case "rectangle":
      return (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: bg,
            borderRadius: br,
            borderWidth: bw,
            borderColor: bc,
            borderStyle: bw > 0 ? "solid" : undefined,
          }}
        />
      );

    case "triangle":
      return (
        <svg
          className="w-full h-full"
          viewBox="0 0 120 104"
          preserveAspectRatio="none"
        >
          <polygon
            points={pointsToString(element.style?.points || [])}
            fill={bg}
            stroke={bw > 0 ? bc : undefined}
            strokeWidth={bw}
          />
        </svg>
      );

    case "line":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="w-full"
            style={{
              height: bw > 0 ? bw : 2,
              backgroundColor: bg,
            }}
          />
        </div>
      );

    case "custom": {
      const { viewBox, dx, dy } = computePathViewBox(
        element.style?.pathData || ""
      );
      return (
        <svg
          className="w-full h-full"
          viewBox={viewBox}
          preserveAspectRatio="none"
        >
          <g transform={`translate(${dx}, ${dy})`}>
            <path
              d={element.style?.pathData || ""}
              fill={bg}
              stroke={bw > 0 ? bc : undefined}
              strokeWidth={bw}
            />
          </g>
        </svg>
      );
    }

    default:
      return (
        <div className="w-full h-full" style={{ backgroundColor: bg }} />
      );
  }
}
