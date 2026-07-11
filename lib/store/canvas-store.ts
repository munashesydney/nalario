"use client";

import { create } from "zustand";
import {
  CanvasElement,
  AIMessage,
  ElementType,
  ShapeKind,
} from "../types/canvas";
import { createElement, generateId } from "../services/canvas-service";
import { AIChat } from "../models/ai-chat.model";

export interface SnapLine {
  axis: "x" | "y";
  value: number;
}

const SEED_MESSAGES: AIMessage[] = [];

interface CanvasStore {
  elements: CanvasElement[];
  streamingElements: CanvasElement[];
  selectedId: string | null;
  activeTool: "select" | "image" | "text" | "shape";
  activeShapeKind: ShapeKind;
  customPathData: string;
  activePanel: "text" | "shape" | "background" | null;
  panelPosition: "left" | "right";
  activeSnapLines: SnapLine[];
  multiSelectedIds: string[];
  messages: AIMessage[];
  activeChatId: string | null;
  chats: AIChat[];
  canvasWidth: number;
  canvasHeight: number;
  canvasBackgroundColor: string;

  history: CanvasElement[][];
  futureHistory: CanvasElement[][];

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  addElement: (type: ElementType, position?: { x: number; y: number }) => void;
  addImage: (
    src: string,
    position?: { x: number; y: number },
    dimensions?: { width: number; height: number },
  ) => void;
  addElements: (elements: CanvasElement[]) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  deselectAll: () => void;
  setActiveTool: (tool: "select" | "image" | "text" | "shape") => void;
  setActiveShapeKind: (kind: ShapeKind) => void;
  setCustomPathData: (path: string) => void;
  setActivePanel: (panel: "text" | "shape" | "background" | null) => void;
  setPanelPosition: (position: "left" | "right") => void;
  setActiveSnapLines: (lines: SnapLine[]) => void;
  reorderElement: (id: string, action: "up" | "down" | "front" | "back") => void;
  setMultiSelectedIds: (ids: string[]) => void;
  groupElements: () => void;
  ungroupElement: (groupId: string) => void;
  addMessage: (role: "user" | "assistant", content: string) => string;
  updateMessage: (id: string, updates: Partial<AIMessage>) => void;
  setMessages: (messages: AIMessage[]) => void;
  setActiveChatId: (chatId: string | null) => void;
  setChats: (chats: AIChat[]) => void;
  setElements: (elements: CanvasElement[]) => void;
  setStreamingElements: (elements: CanvasElement[]) => void;
  clearStreamingElements: () => void;
  setCanvasDimensions: (width: number, height: number) => void;
  setCanvasBackgroundColor: (color: string) => void;
}

const MAX_HISTORY = 100;

// Helper: deep-clone elements array for history snapshots
function cloneElements(elements: CanvasElement[]): CanvasElement[] {
  return JSON.parse(JSON.stringify(elements));
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  elements: [],
  streamingElements: [],
  selectedId: null,
  activeTool: "select",
  activeShapeKind: "rectangle",
  customPathData: "",
  activePanel: null,
  panelPosition: "left",
  activeSnapLines: [],
  multiSelectedIds: [],
  messages: SEED_MESSAGES,
  activeChatId: null,
  chats: [],
  canvasWidth: 1920,
  canvasHeight: 1080,
  canvasBackgroundColor: "#ffffff",
  history: [],
  futureHistory: [],

  pushHistory: () => {
    set((state) => ({
      history: [...state.history, cloneElements(state.elements)].slice(-MAX_HISTORY),
      futureHistory: [],
    }));
  },

  undo: () => {
    const state = get();
    if (state.history.length === 0) return;
    const previous = state.history[state.history.length - 1];
    set({
      history: state.history.slice(0, -1),
      futureHistory: [...state.futureHistory, cloneElements(state.elements)],
      elements: previous,
      selectedId: null,
      multiSelectedIds: [],
      activePanel: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.futureHistory.length === 0) return;
    const next = state.futureHistory[state.futureHistory.length - 1];
    set({
      futureHistory: state.futureHistory.slice(0, -1),
      history: [...state.history, cloneElements(state.elements)],
      elements: next,
      selectedId: null,
      multiSelectedIds: [],
      activePanel: null,
    });
  },

  addElement: (type, position) => {
    get().pushHistory();
    const shapeKind = type === "shape" ? get().activeShapeKind : undefined;
    const pathData =
      type === "shape" && shapeKind === "custom"
        ? get().customPathData
        : undefined;
    const element = createElement(
      type,
      position || { x: 100, y: 100 },
      undefined,
      shapeKind,
      pathData,
    );
    set((state) => ({
      elements: [...state.elements, element],
      selectedId: element.id,
      activeTool: "select",
      customPathData: "",
    }));
  },

  addImage: (src, position, dimensions) => {
    get().pushHistory();
    const id = generateId();
    const element: CanvasElement = {
      id,
      type: "image",
      position: position || { x: 100, y: 100 },
      dimensions: dimensions || { width: 200, height: 200 },
      style: {
        src,
        backgroundColor: "transparent",
      },
    };
    set((state) => ({
      elements: [...state.elements, element],
      selectedId: element.id,
      activeTool: "select",
    }));
  },

  addElements: (newElements) => {
    get().pushHistory();
    set((state) => ({
      elements: [...state.elements, ...newElements],
    }));
  },

  setElements: (elements) => {
    get().pushHistory();
    set({ elements, selectedId: null, multiSelectedIds: [], activePanel: null });
  },

  setStreamingElements: (streamingElements) => {
    set({ streamingElements });
  },

  clearStreamingElements: () => {
    set({ streamingElements: [] });
  },

  setCanvasDimensions: (canvasWidth, canvasHeight) => {
    set({ canvasWidth, canvasHeight });
  },

  setCanvasBackgroundColor: (canvasBackgroundColor) => {
    set({ canvasBackgroundColor });
  },

  updateElement: (id, updates) => {
    set((state) => {
      // Drag/resize push their own history snapshot once at the start,
      // so we skip snapshotting for position/dimensions-only updates
      // (which are continuous mousemove updates during drag/resize).
      // Content edits (e.g. text content) and style-panel changes
      // include other keys (content, style) and will snapshot.
      const updateKeys = Object.keys(updates);
      const isDragOrResizeOnly =
        updateKeys.length > 0 &&
        updateKeys.every((k) => k === "position" || k === "dimensions");
      if (!isDragOrResizeOnly) {
        get().pushHistory();
      }
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el,
        ),
      };
    });
  },

  deleteElement: (id) => {
    get().pushHistory();
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      multiSelectedIds: state.multiSelectedIds.filter((mId) => mId !== id),
      activePanel: state.selectedId === id ? null : state.activePanel,
    }));
  },

  selectElement: (id) => {
    set((state) => ({
      selectedId: id,
      multiSelectedIds: [],
      activePanel: state.selectedId !== id ? null : state.activePanel,
      elements: state.elements.map((el) => ({
        ...el,
        selected: el.id === id,
      })),
    }));
  },

  deselectAll: () => {
    set((state) => ({
      selectedId: null,
      multiSelectedIds: [],
      activePanel: null,
      elements: state.elements.map((el) => ({ ...el, selected: false })),
    }));
  },

  setActiveTool: (tool) => {
    set({ activeTool: tool });
  },

  setActiveShapeKind: (kind) => {
    set({ activeShapeKind: kind });
  },

  setCustomPathData: (path) => {
    set({ customPathData: path });
  },

  setActivePanel: (panel) => {
    set({ activePanel: panel });
  },

  setPanelPosition: (position) => {
    set({ panelPosition: position });
  },

  setActiveSnapLines: (lines) => {
    set({ activeSnapLines: lines });
  },

  reorderElement: (id, action) => {
    get().pushHistory();
    set((state) => {
      const idx = state.elements.findIndex((el) => el.id === id);
      if (idx === -1) return state;

      const newElements = [...state.elements];
      const element = newElements.splice(idx, 1)[0];

      if (action === "up") {
        newElements.splice(Math.min(idx + 1, newElements.length), 0, element);
      } else if (action === "down") {
        newElements.splice(Math.max(idx - 1, 0), 0, element);
      } else if (action === "front") {
        newElements.push(element);
      } else if (action === "back") {
        newElements.unshift(element);
      }

      return { elements: newElements };
    });
  },

  setMultiSelectedIds: (ids) => {
    set({ multiSelectedIds: ids, selectedId: null, activePanel: null });
  },

  groupElements: () => {
    get().pushHistory();
    set((state) => {
      if (state.multiSelectedIds.length < 2) return state;

      const children = state.elements.filter(el => state.multiSelectedIds.includes(el.id));
      if (children.length === 0) return state;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      children.forEach(c => {
        if (c.position.x < minX) minX = c.position.x;
        if (c.position.y < minY) minY = c.position.y;
        if (c.position.x + c.dimensions.width > maxX) maxX = c.position.x + c.dimensions.width;
        if (c.position.y + c.dimensions.height > maxY) maxY = c.position.y + c.dimensions.height;
      });

      // Update children relative to new group
      const relativeChildren = children.map(c => ({
        ...c,
        position: {
          x: c.position.x - minX,
          y: c.position.y - minY,
        }
      }));

      const group: CanvasElement = {
        id: generateId(),
        type: "group",
        position: { x: minX, y: minY },
        dimensions: { width: maxX - minX, height: maxY - minY },
        children: relativeChildren,
        selected: true,
      };

      const newElements = state.elements.filter(el => !state.multiSelectedIds.includes(el.id));
      newElements.push(group);

      return {
        elements: newElements,
        selectedId: group.id,
        multiSelectedIds: [],
      };
    });
  },

  ungroupElement: (groupId) => {
    get().pushHistory();
    set((state) => {
      const groupIdx = state.elements.findIndex(el => el.id === groupId);
      if (groupIdx === -1) return state;

      const group = state.elements[groupIdx];
      if (group.type !== "group" || !group.children) return state;

      const newElements = [...state.elements];
      newElements.splice(groupIdx, 1);

      const restoredChildren = group.children.map(c => ({
        ...c,
        position: {
          x: c.position.x + group.position.x,
          y: c.position.y + group.position.y,
        }
      }));

      newElements.push(...restoredChildren);

      return {
        elements: newElements,
        selectedId: null,
        multiSelectedIds: restoredChildren.map(c => c.id),
      };
    });
  },

  addMessage: (role, content) => {
    const message: AIMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, message],
    }));
    return message.id;
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },
  
  setMessages: (messages) => {
    set({ messages });
  },
  
  setActiveChatId: (chatId) => {
    set({ activeChatId: chatId });
  },
  
  setChats: (chats) => {
    set({ chats });
  },
}));
