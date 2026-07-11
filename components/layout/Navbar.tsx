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
import { useModalStore } from "../../lib/store/modal-store";
import { exportAsPNG, exportAsSVG, exportAsPDF, exportAsJSON, importFromJSON } from "../../lib/services/export-service";

export function Navbar({ chatPanelOpen = false, projectName = "Untitled Project", workspaceId }: { chatPanelOpen?: boolean, projectName?: string, workspaceId?: string }) {
  const { setElements, deselectAll, undo, redo } = useCanvasStore();
  const canUndo = useCanvasStore((s) => s.history.length > 0);
  const canRedo = useCanvasStore((s) => s.futureHistory.length > 0);
  const { openModal } = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedElements = await importFromJSON(file);
      setElements(importedElements);
    } catch (err) {
      alert("Failed to import JSON file. Please ensure it's a valid Nalario project.");
    }
    // Clear input so the same file can be imported again if needed
    e.target.value = '';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white">
      {/* Bottom border — stops before the chat panel when it's open */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-px bg-zinc-200",
          chatPanelOpen ? "right-[320px]" : "right-0",
        )}
      />
      {/* Absolutely centered undo/redo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 transition-colors ${
              canUndo
                ? "text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                : "text-zinc-300 cursor-not-allowed"
            }`}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 transition-colors ${
              canRedo
                ? "text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                : "text-zinc-300 cursor-not-allowed"
            }`}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Left: Logo + project name */}
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={workspaceId ? `/workspaces/${workspaceId}` : "/workspaces"} className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-80">
            <div className="w-8 h-8 bg-zinc-900 flex items-center justify-center rounded-none">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900 text-lg tracking-tight group-hover:text-zinc-700 transition-colors uppercase">
              Nalario
            </span>
          </Link>

          <div className="h-5 w-px bg-zinc-200 ml-1 mr-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer select-none group px-2 py-1 rounded hover:bg-zinc-100 transition-colors">
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">
                  {projectName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem className="gap-2.5">
                Rename project
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2.5">
                Project settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: 3-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem className="gap-2.5" onClick={() => openModal('export-project', { projectName })}>
              <Download className="w-4 h-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
