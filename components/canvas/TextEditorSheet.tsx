"use client";

import React from "react";
import { SidePanel } from "../layout/SidePanel";
import { useCanvasStore } from "../../lib/store/canvas-store";
import {
  FONT_FAMILIES,
  FONT_SIZES,
  TEXT_ALIGN_OPTIONS,
  buildTextStyleInline,
} from "../../lib/services/text-service";
import { cn } from "../../lib/utils";

export function TextEditorSheet({ open }: { open: boolean }) {
  const { elements, selectedId, updateElement, setActivePanel, panelPosition } = useCanvasStore();

  const selectedElement = elements.find((el) => el.id === selectedId);
  const isTextSelected = selectedElement?.type === "text";

  const style = selectedElement?.style ?? {};
  const rotation = selectedElement?.rotation ?? 0;

  const updateStyle = (updates: Record<string, unknown>) => {
    if (!selectedId) return;
    updateElement(selectedId, {
      style: { ...style, ...updates },
    });
  };

  const updateRotation = (deg: number) => {
    if (!selectedId) return;
    updateElement(selectedId, { rotation: deg });
  };

  return (
    <SidePanel 
      open={open} 
      title="Text Settings" 
      variant="floating" 
      position={panelPosition}
      onClose={() => setActivePanel(null)}
    >
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 min-w-0 custom-scrollbar">
        {/* Font Family */}
        <fieldset>
          <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Font Family
          </label>
          <select
            value={style.fontFamily ?? "Inter, sans-serif"}
            onChange={(e) => updateStyle({ fontFamily: e.target.value })}
            className="block w-full text-sm font-bold border-2 border-zinc-900 rounded-none px-2.5 py-1.5 bg-white text-zinc-900 focus:outline-none focus:border-pink-500 transition-colors"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </fieldset>

        {/* Font Size */}
        <fieldset>
          <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Font Size
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={10}
              max={72}
              step={1}
              value={style.fontSize ?? 24}
              onChange={(e) =>
                updateStyle({ fontSize: Number(e.target.value) })
              }
              className="flex-1 h-1.5 accent-pink-500"
            />
            <select
              value={style.fontSize ?? 24}
              onChange={(e) =>
                updateStyle({ fontSize: Number(e.target.value) })
              }
              className="w-16 text-sm font-bold border-2 border-zinc-900 rounded-none px-1.5 py-1 bg-white text-zinc-900 focus:outline-none focus:border-pink-500 transition-colors text-center"
            >
              {Array.from(new Set([...FONT_SIZES, style.fontSize ?? 24]))
                .sort((a, b) => a - b)
                .map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
            </select>
          </div>
        </fieldset>

        {/* Font Weight */}
        <fieldset>
          <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Weight
          </label>
          <div className="flex gap-1">
            {[
              { label: "Normal", value: "400" },
              { label: "Medium", value: "500" },
              { label: "SemiBold", value: "600" },
              { label: "Bold", value: "700" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateStyle({ fontWeight: opt.value })}
                className={cn(
                  "flex-1 text-xs font-bold py-1.5 border-2 transition-all rounded-none uppercase",
                  (style.fontWeight ?? "600") === opt.value
                    ? "bg-pink-500 text-white border-zinc-900 shadow-[2px_2px_0px_rgba(24,24,27,1)] -translate-y-[1px] -translate-x-[1px] z-10"
                    : "bg-white text-zinc-900 border-zinc-900 hover:bg-pink-50 hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[2px_2px_0px_rgba(24,24,27,1)]",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Style: Italic / Underline / Strikethrough */}
        <fieldset>
          <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Style
          </label>
          <div className="flex gap-1">
            <button
              onClick={() =>
                updateStyle({
                  fontStyle: style.fontStyle === "italic" ? "normal" : "italic",
                })
              }
              className={cn(
                "flex-1 text-xs font-bold py-1.5 border-2 transition-all rounded-none uppercase",
                style.fontStyle === "italic"
                  ? "bg-pink-500 text-white border-zinc-900 shadow-[2px_2px_0px_rgba(24,24,27,1)] -translate-y-[1px] -translate-x-[1px] z-10"
                  : "bg-white text-zinc-900 border-zinc-900 hover:bg-pink-50 hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[2px_2px_0px_rgba(24,24,27,1)]",
              )}
            >
              <span className="italic">I</span>
            </button>
            <button
              onClick={() =>
                updateStyle({
                  textDecoration:
                    style.textDecoration === "underline" ? "none" : "underline",
                })
              }
              className={cn(
                "flex-1 text-xs font-bold py-1.5 border-2 transition-all rounded-none uppercase",
                style.textDecoration === "underline"
                  ? "bg-pink-500 text-white border-zinc-900 shadow-[2px_2px_0px_rgba(24,24,27,1)] -translate-y-[1px] -translate-x-[1px] z-10"
                  : "bg-white text-zinc-900 border-zinc-900 hover:bg-pink-50 hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[2px_2px_0px_rgba(24,24,27,1)]",
              )}
            >
              <span className="underline">U</span>
            </button>
            <button
              onClick={() =>
                updateStyle({
                  textDecoration:
                    style.textDecoration === "line-through"
                      ? "none"
                      : "line-through",
                })
              }
              className={cn(
                "flex-1 text-xs font-bold py-1.5 border-2 transition-all rounded-none uppercase",
                style.textDecoration === "line-through"
                  ? "bg-pink-500 text-white border-zinc-900 shadow-[2px_2px_0px_rgba(24,24,27,1)] -translate-y-[1px] -translate-x-[1px] z-10"
                  : "bg-white text-zinc-900 border-zinc-900 hover:bg-pink-50 hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[2px_2px_0px_rgba(24,24,27,1)]",
              )}
            >
              <span className="line-through">S</span>
            </button>
          </div>
        </fieldset>

        {/* Alignment */}
        <fieldset>
          <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Alignment
          </label>
          <div className="flex gap-1">
            {TEXT_ALIGN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateStyle({ textAlign: opt.value })}
                className={cn(
                  "flex-1 text-xs font-bold py-1.5 border-2 transition-all rounded-none uppercase",
                  (style.textAlign ?? "left") === opt.value
                    ? "bg-pink-500 text-white border-zinc-900 shadow-[2px_2px_0px_rgba(24,24,27,1)] -translate-y-[1px] -translate-x-[1px] z-10"
                    : "bg-white text-zinc-900 border-zinc-900 hover:bg-pink-50 hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[2px_2px_0px_rgba(24,24,27,1)]",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Text Color */}
        <fieldset>
          <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Text Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.color ?? "#1f2937"}
              onChange={(e) => updateStyle({ color: e.target.value })}
              className="w-8 h-8 p-0 border-2 border-zinc-900 cursor-pointer bg-white rounded-none"
            />
            <input
              type="text"
              value={style.color ?? "#1f2937"}
              onChange={(e) => updateStyle({ color: e.target.value })}
              className="flex-1 text-sm font-bold border-2 border-zinc-900 rounded-none px-2 py-1 bg-white text-zinc-900 font-mono focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
        </fieldset>

        {/* Background Color */}
        <fieldset>
          <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.backgroundColor ?? "#ffffff"}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              className="w-8 h-8 p-0 border-2 border-zinc-900 cursor-pointer bg-white rounded-none"
            />
            <input
              type="text"
              value={style.backgroundColor ?? "#ffffff"}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              className="flex-1 text-sm font-bold border-2 border-zinc-900 rounded-none px-2 py-1 bg-white text-zinc-900 font-mono focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
        </fieldset>

        {/* Rotation */}
        <fieldset>
          <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Rotation
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => updateRotation(Number(e.target.value))}
              className="flex-1 h-1.5 accent-pink-500"
            />
            <span className="w-10 text-xs text-zinc-500 text-right tabular-nums">
              {rotation}°
            </span>
          </div>
        </fieldset>

        {/* Inline preview */}
        <div className="pt-4 border-t-4 border-zinc-900">
          <p className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Preview
          </p>
          <div
            className="p-3 border-2 border-zinc-900 bg-white shadow-[4px_4px_0px_rgba(24,24,27,1)]"
            style={buildTextStyleInline(style)}
          >
            {selectedElement?.content || "Aa"}
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
