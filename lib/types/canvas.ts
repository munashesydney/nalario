export type ElementType = "image" | "text" | "shape" | "group";

export type ShapeKind =
  "rectangle" | "circle" | "ellipse" | "triangle" | "line" | "custom";

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  position: Position;
  dimensions: Dimensions;
  rotation?: number;
  content?: string;
  style?: ElementStyle;
  selected?: boolean;
  children?: CanvasElement[];
}

export type TextAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";
export type FontStyle = "normal" | "italic";
export type TextDecoration = "none" | "underline" | "line-through";

export interface ElementStyle {
  // Text
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: FontStyle;
  textDecoration?: TextDecoration;
  textAlign?: TextAlign;
  verticalAlign?: VerticalAlign;
  textSizing?: "auto" | "fixed";
  color?: string;
  backgroundColor?: string;

  // Shape
  shapeKind?: ShapeKind;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  points?: { x: number; y: number }[];
  pathData?: string;

  // Image
  src?: string;
}

export interface CanvasState {
  elements: CanvasElement[];
  selectedId: string | null;
  activeTool: "select" | "image" | "text" | "shape";
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  timestamp: Date;
}
