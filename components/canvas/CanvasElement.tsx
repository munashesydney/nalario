"use client";

import { useState, useRef, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { CanvasElement as CanvasElementType } from "../../lib/types/canvas";
import { Image } from "lucide-react";
import { useDrag } from "../../hooks/canvas";
import {
  pointsToString,
  computePathViewBox,
} from "../../lib/services/shape-service";

interface DraggableElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  isMultiSelected?: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElementType>) => void;
  canvasBounds: { width: number; height: number };
  isStreaming?: boolean;
  elementRef?: React.RefObject<HTMLDivElement | null>;
}

export function DraggableElement({
  element,
  isSelected,
  isMultiSelected,
  onSelect,
  onUpdate,
  canvasBounds,
  isStreaming = false,
}: DraggableElementProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content || "");
  const elementRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const isText = element.type === "text";

  // --- Hooks ---

  const { handleMouseDown } = useDrag({
    element,
    canvasBounds,
    elementRef,
    isText,
    isEditing,
    onSelect,
    onUpdate,
  });

  // --- Editing ---

  useEffect(() => {
    setEditContent(element.content || "");
  }, [element.content]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isText) setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editContent !== element.content) {
      onUpdate({ content: editContent });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({});
  };

  // --- Render ---

  const renderContent = () => {
    if (element.type === "group" && element.children) {
      return (
        <div className="w-full h-full relative pointer-events-none">
          {element.children.map((child) => (
            <DraggableElement
              key={child.id}
              element={child}
              isSelected={false}
              onSelect={() => {}}
              onUpdate={() => {}}
              canvasBounds={canvasBounds}
            />
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

        return (
          <div
            ref={textContentRef}
            className={`w-full ${isFixedSize ? "h-full" : "min-h-full"} flex ${alignClass} py-1 px-2`}
            style={{
              backgroundColor: element.style?.backgroundColor || "transparent",
            }}
          >
            <TextareaAutosize
              ref={textareaRef}
              value={isEditing ? editContent : element.content}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              readOnly={!isEditing}
              onHeightChange={(height) => {
                if (!isFixedSize && isEditing && element.dimensions && height !== element.dimensions.height) {
                  onUpdate({
                    dimensions: {
                      ...element.dimensions,
                      height,
                    },
                  });
                }
              }}
              className={`w-full bg-transparent border-none outline-none resize-none text-zinc-900 ${
                !isEditing ? "pointer-events-none" : ""
              }`}
              style={{
                fontSize: element.style?.fontSize,
                fontWeight: element.style?.fontWeight,
                fontFamily: element.style?.fontFamily,
                fontStyle: element.style?.fontStyle,
                textDecoration: element.style?.textDecoration,
                textAlign: element.style?.textAlign,
                color: element.style?.color,
                overflow: "hidden",
              }}
            />
          </div>
        );
      }

      case "shape":
        return renderShape();
    }
  };

  const renderShape = () => {
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
          element.style?.pathData || "",
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
  };

  if (!element.position) return null;

  return (
    <div
      ref={elementRef}
      data-element-id={element.id}
      className={`absolute cursor-move group ${
        isStreaming ? "opacity-70 pointer-events-none animate-pulse" : ""
      }`}
      style={{
        left: element.position.x,
        top: element.position.y,
        transform: `rotate(${element.rotation ?? 0}deg)`,
        transformOrigin: "center center",
        ...(isText
          ? {
              width: element.dimensions?.width ?? 100,
              ...(element.style?.textSizing === "fixed" 
                ? { height: element.dimensions?.height ?? 20 }
                : { minHeight: element.dimensions?.height ?? 20 }),
            }
          : {
              width: element.dimensions?.width ?? 100,
              height: element.dimensions?.height ?? 100,
            }),
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover border (only if not hovered + not selected/multi-selected) */}
      {isHovered && !isSelected && !isMultiSelected && (
        <div className="absolute -inset-0.5 border-2 border-pink-300 pointer-events-none" />
      )}

      {isMultiSelected && (
        <div className="absolute -inset-0.5 border-2 border-pink-500/50 pointer-events-none" />
      )}

      {renderContent()}
    </div>
  );
}
