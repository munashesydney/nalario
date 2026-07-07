"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { useCanvasStore } from "../../lib/store/canvas-store";
import {
  exportAsPNG,
  exportAsSVG,
  exportAsPDF,
  exportAsJSON,
} from "../../lib/services/export-service";
import { cn } from "../../lib/utils";



import { useModalStore } from "../../lib/store/modal-store";

type ExportFormat = "png" | "svg" | "pdf" | "json";

export default function ExportModal() {
  const { data, closeModal } = useModalStore();
  const projectName = data?.projectName || "Untitled Project";
  const { elements, deselectAll, canvasWidth, canvasHeight, canvasBackgroundColor } = useCanvasStore();
  const [format, setFormat] = useState<ExportFormat>("png");
  const [transparent, setTransparent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);



  const handleExport = async () => {
    setIsExporting(true);
    try {
      deselectAll();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const canvasNode = document.querySelector("[data-canvas]") as HTMLElement;
      if (!canvasNode) throw new Error("Canvas not found");

      const filename = `${projectName.replace(/\s+/g, "-").toLowerCase()}`;
      const exportBg = transparent ? "transparent" : (canvasBackgroundColor || "#ffffff");

      if (format === "png") {
        await exportAsPNG(canvasNode, { filename: `${filename}.png`, transparent, backgroundColor: exportBg });
      } else if (format === "svg") {
        await exportAsSVG(canvasNode, { filename: `${filename}.svg`, transparent, backgroundColor: exportBg });
      } else if (format === "pdf") {
        await exportAsPDF(canvasNode, { filename: `${filename}.pdf`, transparent, backgroundColor: exportBg });
      } else if (format === "json") {
        exportAsJSON(elements, `${filename}.json`);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-zinc-50 border-4 border-zinc-900 flex flex-col shadow-[8px_8px_0px_rgba(24,24,27,1)] rounded-none">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b-4 border-zinc-900 bg-white">
        <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">Export Project</h2>
        <button
          onClick={closeModal}
          className="p-2 hover:bg-pink-100 text-zinc-900 transition-colors border-2 border-transparent hover:border-zinc-900 rounded-none"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col md:flex-row gap-8 bg-zinc-50">
        {/* Left: Preview Area */}
        <div className="flex-1 flex flex-col">
          <label className="font-bold text-zinc-900 text-sm uppercase mb-3">
            Preview
          </label>
          <div className="flex-1 bg-white border-4 border-zinc-900 overflow-hidden relative flex items-center justify-center min-h-[300px]">
            {/* Checkerboard background to show transparency */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
              }}
            />

            {/* A simple placeholder box representing the canvas to show color */}
            <div
              className="relative shadow-md border-2 border-zinc-900"
              style={{
                width: canvasWidth > canvasHeight ? "80%" : "auto",
                height: canvasHeight > canvasWidth ? "80%" : "auto",
                aspectRatio: `${canvasWidth} / ${canvasHeight}`,
                backgroundColor: transparent ? "transparent" : (canvasBackgroundColor || "#ffffff"),
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-zinc-900/20 text-zinc-900 font-bold text-sm bg-white/50 backdrop-blur-sm">
                {canvasWidth} x {canvasHeight}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Options */}
        <div className="w-full md:w-72 space-y-8">
          <div>
            <label className="font-bold text-zinc-900 text-sm uppercase mb-3 block">
              Format
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "png", label: "PNG Image", desc: "Best for web and sharing" },
                { id: "svg", label: "SVG Vector", desc: "Scales without losing quality" },
                { id: "pdf", label: "PDF Document", desc: "Best for printing" },
                { id: "json", label: "JSON Data", desc: "Raw project data" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id as ExportFormat)}
                  className={cn(
                    "w-full flex flex-col items-start px-4 py-3 border-4 transition-all rounded-none",
                    format === f.id
                      ? "border-zinc-900 bg-zinc-900 text-white shadow-[4px_4px_0px_rgba(244,114,182,1)] translate-x-[-2px] translate-y-[-2px]"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-900 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  )}
                >
                  <span className="font-bold text-sm uppercase">{f.label}</span>
                  <span className={cn("text-[10px] mt-1 font-mono uppercase", format === f.id ? "text-white/80" : "text-zinc-500")}>
                    {f.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {format !== "json" && (
            <div className="p-4 border-4 border-zinc-900 bg-white">
              <label className="font-bold text-zinc-900 text-sm uppercase mb-3 block">
                Options
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={cn(
                  "w-12 h-6 border-2 border-zinc-900 rounded-full transition-colors relative",
                  transparent ? "bg-pink-500" : "bg-zinc-200"
                )}>
                  <div className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 bg-white border-2 border-zinc-900 rounded-full transition-transform shadow-[1px_1px_0px_rgba(24,24,27,1)]",
                    transparent ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-900 uppercase">
                    Transparent Bg
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">
                    {transparent ? "No background" : "Uses canvas color"}
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t-4 border-zinc-900 bg-white flex justify-end gap-4">
        <button
          onClick={closeModal}
          className="px-6 py-3 border-4 border-zinc-200 hover:border-zinc-900 text-zinc-900 font-bold uppercase transition-all rounded-none"
        >
          Cancel
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-8 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-zinc-300 text-white font-bold border-4 border-zinc-900 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] transition-all uppercase rounded-none flex items-center gap-2"
        >
          {isExporting ? (
            <>Exporting...</>
          ) : (
            <>
              <Download className="w-5 h-5 stroke-[3]" />
              Export {format}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
