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

export function TextEditorSheet() {
  const { elements, selectedId, updateElement } = useCanvasStore();

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
    <SidePanel open={!!isTextSelected} title="Text Settings">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 min-w-0">
        {/* Font Family */}
        <fieldset>
          <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
            Font Family
          </label>
          <select
            value={style.fontFamily ?? "Inter, sans-serif"}
            onChange={(e) => updateStyle({ fontFamily: e.target.value })}
            className="block w-full text-sm border border-zinc-200 rounded-none px-2.5 py-1.5 bg-white text-zinc-800 focus:outline-none focus:border-zinc-400"
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
          <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
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
              className="flex-1 h-1.5 accent-zinc-900"
            />
            <select
              value={style.fontSize ?? 24}
              onChange={(e) =>
                updateStyle({ fontSize: Number(e.target.value) })
              }
              className="w-16 text-sm border border-zinc-200 rounded-none px-1.5 py-1 bg-white text-zinc-800 focus:outline-none focus:border-zinc-400 text-center"
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
          <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
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
                  "flex-1 text-xs py-1.5 border transition-colors",
                  (style.fontWeight ?? "600") === opt.value
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Style: Italic / Underline / Strikethrough */}
        <fieldset>
          <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
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
                "flex-1 text-xs py-1.5 border transition-colors",
                style.fontStyle === "italic"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400",
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
                "flex-1 text-xs py-1.5 border transition-colors",
                style.textDecoration === "underline"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400",
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
                "flex-1 text-xs py-1.5 border transition-colors",
                style.textDecoration === "line-through"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400",
              )}
            >
              <span className="line-through">S</span>
            </button>
          </div>
        </fieldset>

        {/* Alignment */}
        <fieldset>
          <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
            Alignment
          </label>
          <div className="flex gap-1">
            {TEXT_ALIGN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateStyle({ textAlign: opt.value })}
                className={cn(
                  "flex-1 text-xs py-1.5 border transition-colors",
                  (style.textAlign ?? "left") === opt.value
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Text Color */}
        <fieldset>
          <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
            Text Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.color ?? "#1f2937"}
              onChange={(e) => updateStyle({ color: e.target.value })}
              className="w-8 h-8 p-0.5 border border-zinc-200 cursor-pointer bg-white"
            />
            <input
              type="text"
              value={style.color ?? "#1f2937"}
              onChange={(e) => updateStyle({ color: e.target.value })}
              className="flex-1 text-sm border border-zinc-200 rounded-none px-2 py-1 bg-white text-zinc-800 font-mono focus:outline-none focus:border-zinc-400"
            />
          </div>
        </fieldset>

        {/* Background Color */}
        <fieldset>
          <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.backgroundColor ?? "#ffffff"}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              className="w-8 h-8 p-0.5 border border-zinc-200 cursor-pointer bg-white"
            />
            <input
              type="text"
              value={style.backgroundColor ?? "#ffffff"}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              className="flex-1 text-sm border border-zinc-200 rounded-none px-2 py-1 bg-white text-zinc-800 font-mono focus:outline-none focus:border-zinc-400"
            />
          </div>
        </fieldset>

        {/* Rotation */}
        <fieldset>
          <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
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
              className="flex-1 h-1.5 accent-zinc-900"
            />
            <span className="w-10 text-xs text-zinc-500 text-right tabular-nums">
              {rotation}°
            </span>
          </div>
        </fieldset>

        {/* Inline preview */}
        <div className="pt-2 border-t border-zinc-100">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Preview
          </p>
          <div
            className="p-3 border border-zinc-100 bg-zinc-50"
            style={buildTextStyleInline(style)}
          >
            {selectedElement?.content || "Aa"}
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
