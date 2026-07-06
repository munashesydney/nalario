"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Layers,
  Undo,
  Redo,
  MoreHorizontal,
  Download,
  Settings,
  Share,
  Copy,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../../lib/utils";
import { useCanvasStore } from "../../lib/store/canvas-store";
import { exportAsPNG, exportAsSVG, exportAsPDF, exportAsJSON, importFromJSON } from "../../lib/services/export-service";

export function Navbar({ chatPanelOpen = false }: { chatPanelOpen?: boolean }) {
  const [projectName] = useState("Untitled Project");
  const { elements, setElements, deselectAll } = useCanvasStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (format: 'png' | 'svg' | 'pdf' | 'json') => {
    // 1. Deselect everything so handles/borders are hidden
    deselectAll();

    // Give React a frame to update the DOM (hide the borders)
    await new Promise((resolve) => requestAnimationFrame(resolve));
    
    // 2. Grab the canvas node
    const canvasNode = document.querySelector('[data-canvas]') as HTMLElement;
    if (!canvasNode) return;

    // 3. Export
    const filename = `${projectName.replace(/\s+/g, '-').toLowerCase()}`;
    if (format === 'png') {
      await exportAsPNG(canvasNode, `${filename}.png`);
    } else if (format === 'svg') {
      await exportAsSVG(canvasNode, `${filename}.svg`);
    } else if (format === 'pdf') {
      await exportAsPDF(canvasNode, `${filename}.pdf`);
    } else if (format === 'json') {
      exportAsJSON(elements, `${filename}.json`);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedElements = await importFromJSON(file);
      setElements(importedElements);
    } catch (err) {
      alert("Failed to import JSON file. Please ensure it's a valid canvas project.");
    }
    // Clear input so the same file can be imported again if needed
    e.target.value = '';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-white">
      {/* Bottom border — stops before the chat panel when it\'s open */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-px bg-zinc-200",
          chatPanelOpen ? "right-[320px]" : "right-0",
        )}
      />
      {/* Absolutely centered undo/redo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto">
          <button className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors">
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Left: Logo + project name */}
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/workspaces" className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-80">
            <div className="w-7 h-7 bg-zinc-900 flex items-center justify-center rounded-md">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 text-sm tracking-tight group-hover:text-pink-600 transition-colors">
              Canvas
            </span>
          </Link>

          <div className="h-4 w-px bg-zinc-200 ml-2" />

          <div className="flex items-center gap-1 cursor-pointer select-none group">
            <span className="text-sm text-zinc-500 group-hover:text-zinc-700 transition-colors">
              {projectName}
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
          </div>
        </div>

        {/* Right: 3-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem className="gap-2.5" onClick={() => handleExport('png')}>
              <Download className="w-4 h-4" />
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5" onClick={() => handleExport('svg')}>
              <Download className="w-4 h-4" />
              Export as SVG
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5" onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2.5" onClick={() => handleExport('json')}>
              <Download className="w-4 h-4" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5" onClick={() => fileInputRef.current?.click()}>
              <Download className="w-4 h-4 rotate-180" />
              Import from JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2.5">
              <Share className="w-4 h-4" />
              Share link
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5">
              <Copy className="w-4 h-4" />
              Duplicate project
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5">
              <Settings className="w-4 h-4" />
              Project settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2.5 text-red-600 focus:text-red-600 focus:bg-red-50">
              <Trash2 className="w-4 h-4" />
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Hidden file input for JSON import */}
        <input 
          type="file" 
          accept=".json,application/json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </header>
  );
}
