"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface SidePanelProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  variant?: "drawer" | "floating";
  position?: "left" | "right";
  onClose?: () => void;
}

/**
 * Reusable panel that can act as a fixed drawer or a floating relative card.
 */
export function SidePanel({ open, title, children, variant = "drawer", position = "left", onClose }: SidePanelProps) {
  const isFloating = variant === "floating";

  return (
    <div
      className={cn(
        "z-40 flex flex-col bg-zinc-50 transition-all duration-300 ease-in-out",
        isFloating
          ? cn("relative rounded-none border-4 border-zinc-900 shadow-[8px_8px_0px_rgba(24,24,27,1)] my-4 h-[calc(100%-32px)]", position === "left" ? "ml-4" : "mr-4")
          : "fixed top-0 right-0 bottom-0 border-l-4 border-zinc-900 shadow-[-8px_0px_0px_rgba(24,24,27,1)]",
        open
          ? cn("w-80 opacity-100")
          : cn(
              "w-0 opacity-0 pointer-events-none overflow-hidden", 
              isFloating ? cn("border-none", position === "left" ? "ml-0" : "mr-0") : "border-l-0"
            )
      )}
    >
      <div
        className={cn(
          "h-14 shrink-0 flex items-center justify-between px-5 bg-white",
          open ? "border-b-4 border-zinc-900" : "border-b-4 border-zinc-900"
        )}
      >
        <span className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
          {title}
        </span>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 hover:bg-pink-100 text-zinc-900 transition-colors border-2 border-transparent hover:border-zinc-900 rounded-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-zinc-50">
        {children}
      </div>
    </div>
  );
}
