import {
  CanvasElement,
  ElementType,
  Position,
  Dimensions,
  ShapeKind,
} from "../types/canvas";
import { getShapeDef } from "./shape-service";

let elementCounter = 0;

export function generateId(): string {
  return `element-${Date.now()}-${elementCounter++}`;
}

export function createElement(
  type: ElementType,
  position: Position,
  dimensions?: Dimensions,
  shapeKind?: ShapeKind,
  pathData?: string,
): CanvasElement {
  const id = generateId();

  const defaultDimensions: Record<ElementType, Dimensions> = {
    image: { width: 200, height: 150 },
    text: { width: 200, height: 40 },
    shape: { width: 150, height: 150 },
    group: { width: 0, height: 0 },
  };

  const defaults: Record<ElementType, Partial<CanvasElement>> = {
    image: {
      style: {
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
      },
    },
    text: {
      content: "Double-click to edit",
      style: {
        fontSize: 24,
        fontWeight: "600",
        fontFamily: "Inter, sans-serif",
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: "left",
        color: "#1f2937",
        backgroundColor: "transparent",
      },
    },
    shape: {
      style: {},
    },
    group: {},
  };

  // Apply shape-kind defaults for shapes
  if (type === "shape" && shapeKind) {
    const def = getShapeDef(shapeKind);
    defaults.shape = {
      style: {
        shapeKind,
        backgroundColor: "#3b82f6",
        borderRadius: 8,
        borderWidth: 0,
        borderColor: "transparent",
        ...def.defaultStyle,
        ...(pathData ? { pathData } : {}),
      },
    };
    if (def.defaultDims) {
      defaultDimensions.shape = def.defaultDims;
    }
  } else if (type === "shape") {
    // Fallback: rectangle defaults
    defaults.shape = {
      style: {
        shapeKind: "rectangle",
        backgroundColor: "#3b82f6",
        borderRadius: 8,
        borderWidth: 0,
        borderColor: "transparent",
      },
    };
  }

  return {
    id,
    type,
    position,
    dimensions: dimensions || defaultDimensions[type],
    ...defaults[type],
  };
}

export function clampPosition(
  pos: Position,
  dims: Dimensions,
  canvasWidth: number,
  canvasHeight: number,
): Position {
  return {
    x: Math.max(0, Math.min(pos.x, canvasWidth - dims.width)),
    y: Math.max(0, Math.min(pos.y, canvasHeight - dims.height)),
  };
}

export function isPointInElement(
  point: Position,
  element: CanvasElement,
): boolean {
  const { position, dimensions } = element;
  return (
    point.x >= position.x &&
    point.x <= position.x + dimensions.width &&
    point.y >= position.y &&
    point.y <= position.y + dimensions.height
  );
}
