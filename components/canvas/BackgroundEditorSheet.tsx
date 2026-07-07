"use client";

import React from "react";
import { Check } from "lucide-react";
import { useCanvasStore } from "../../lib/store/canvas-store";
import { SidePanel } from "../layout/SidePanel";
import { cn } from "../../lib/utils";

const COLORS = [
  "#ffffff", // white
  "#f4f4f5", // zinc-100
  "#e4e4e7", // zinc-200
  "#000000", // black
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#eab308", // yellow-500
  "#22c55e", // green-500
  "#3b82f6", // blue-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
];

export function BackgroundEditorSheet({ open }: { open: boolean }) {
  const {
    setActivePanel,
    panelPosition,
    canvasBackgroundColor,
    setCanvasBackgroundColor,
  } = useCanvasStore();

  return (
    <SidePanel
      open={open}
      title="Background"
      variant="floating"
      position={panelPosition}
      onClose={() => setActivePanel(null)}
    >
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="font-bold text-zinc-900 text-sm uppercase block">
              Fill Color
            </label>
            
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => setCanvasBackgroundColor("transparent")}
                className={cn(
                  "w-full aspect-square rounded-none border-4 relative overflow-hidden transition-all",
                  canvasBackgroundColor === "transparent"
                    ? "border-zinc-900 shadow-[4px_4px_0px_rgba(244,114,182,1)] -translate-y-1 -translate-x-1 z-10"
                    : "border-zinc-200 hover:border-zinc-900 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:-translate-x-1"
                )}
                title="Transparent"
              >
                {/* Checkerboard pattern for transparent */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)", backgroundSize: "10px 10px", backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px" }} />
                {canvasBackgroundColor === "transparent" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-4 h-4 text-zinc-900" />
                  </div>
                )}
              </button>

              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCanvasBackgroundColor(c)}
                  className={cn(
                    "w-full aspect-square rounded-none border-4 relative transition-all",
                    canvasBackgroundColor === c
                      ? "border-zinc-900 shadow-[4px_4px_0px_rgba(244,114,182,1)] -translate-y-1 -translate-x-1 z-10"
                      : "border-zinc-200 hover:border-zinc-900 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:-translate-x-1"
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {canvasBackgroundColor === c && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check
                        className={cn(
                          "w-4 h-4",
                          ["#ffffff", "#f4f4f5", "#e4e4e7", "transparent"].includes(c)
                            ? "text-zinc-900"
                            : "text-white"
                        )}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
