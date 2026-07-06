import React, { useState, useRef, useEffect } from "react";
import { useCanvasStore } from "../../lib/store/canvas-store";
import { cn } from "../../lib/utils";
import { Type, PaintBucket, Trash2, MoreHorizontal, ArrowLeftRight, ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, Group, Ungroup } from "lucide-react";

interface FloatingToolbarProps {
  scale: number;
}

export function FloatingToolbar({ scale }: FloatingToolbarProps) {
  const { elements, selectedId, multiSelectedIds, panelPosition, setPanelPosition, setActivePanel, deleteElement, reorderElement, groupElements, ungroupElement } = useCanvasStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isMultiSelect = multiSelectedIds.length > 1;
  const selectedElement = elements.find((el) => el.id === selectedId);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!selectedElement && !isMultiSelect) return null;

  // Calculate position for the toolbar
  let left = 0;
  let top = 0;

  if (isMultiSelect) {
    const selectedElements = elements.filter(el => multiSelectedIds.includes(el.id));
    if (selectedElements.length > 0) {
      let minX = Infinity;
      let minY = Infinity;
      selectedElements.forEach(el => {
        if (el.position.x < minX) minX = el.position.x;
        if (el.position.y < minY) minY = el.position.y;
      });
      left = minX;
      top = minY - 12;
    }
  } else if (selectedElement) {
    left = selectedElement.position.x;
    top = selectedElement.position.y - 12;
  }

  // The toolbar floats slightly above the element
  // We apply a counter-scale so the UI remains consistently sized regardless of canvas zoom
  return (
    <div
      className="absolute z-50 flex items-center bg-white shadow-xl rounded-lg border border-zinc-200 px-1 py-1"
      style={{
        left,
        top,
        transform: `scale(${1 / scale}) translateY(-100%)`,
        transformOrigin: "bottom left",
      }}
    >
      {isMultiSelect ? (
        <>
          <button
            onClick={groupElements}
            className="p-2 hover:bg-zinc-100 rounded-md transition-colors text-zinc-700 flex items-center gap-2 text-sm pr-3"
            title="Group Elements"
          >
            <Group className="w-4 h-4" /> Group
          </button>
          <div className="w-px h-4 bg-zinc-200 mx-1" />
          <button
            onClick={() => {
              multiSelectedIds.forEach(id => deleteElement(id));
            }}
            className="p-2 hover:bg-zinc-100 hover:text-red-600 rounded-md transition-colors text-zinc-700"
            title="Delete Selected"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      ) : selectedElement ? (
        <>
          {selectedElement.type === "text" && (
            <>
              <button
                onClick={() => setActivePanel("text")}
                className="p-2 hover:bg-zinc-100 rounded-md transition-colors text-zinc-700"
                title="Text Options"
              >
                <Type className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-zinc-200 mx-1" />
            </>
          )}

          {selectedElement.type === "shape" && (
            <>
              <button
                onClick={() => setActivePanel("shape")}
                className="p-2 hover:bg-zinc-100 rounded-md transition-colors text-zinc-700"
                title="Shape Options"
              >
                <PaintBucket className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-zinc-200 mx-1" />
            </>
          )}

          {selectedElement.type === "group" && (
            <>
              <button
                onClick={() => ungroupElement(selectedElement.id)}
                className="p-2 hover:bg-zinc-100 rounded-md transition-colors text-zinc-700 flex items-center gap-2 text-sm pr-3"
                title="Ungroup"
              >
                <Ungroup className="w-4 h-4" /> Ungroup
              </button>
              <div className="w-px h-4 bg-zinc-200 mx-1" />
            </>
          )}

          <button
            onClick={() => {
              if (selectedId) deleteElement(selectedId);
            }}
            className="p-2 hover:bg-zinc-100 hover:text-red-600 rounded-md transition-colors text-zinc-700"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-zinc-200 mx-1" />

          <button 
            onClick={() => setPanelPosition(panelPosition === "left" ? "right" : "left")}
            className="p-2 hover:bg-zinc-100 rounded-md transition-colors text-zinc-700" 
            title="Switch Sides"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* More Options Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                "p-2 rounded-md transition-colors text-zinc-700",
                menuOpen ? "bg-zinc-100" : "hover:bg-zinc-100"
              )} 
              title="More"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden py-1">
                <button
                  onClick={() => { reorderElement(selectedId!, "up"); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 text-left"
                >
                  <ArrowUp className="w-4 h-4 text-zinc-400" /> Bring Forward
                </button>
                <button
                  onClick={() => { reorderElement(selectedId!, "down"); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 text-left"
                >
                  <ArrowDown className="w-4 h-4 text-zinc-400" /> Send Backward
                </button>
                <div className="h-px w-full bg-zinc-100 my-1" />
                <button
                  onClick={() => { reorderElement(selectedId!, "front"); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 text-left"
                >
                  <ArrowUpToLine className="w-4 h-4 text-zinc-400" /> Bring to Front
                </button>
                <button
                  onClick={() => { reorderElement(selectedId!, "back"); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 text-left"
                >
                  <ArrowDownToLine className="w-4 h-4 text-zinc-400" /> Send to Back
                </button>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
