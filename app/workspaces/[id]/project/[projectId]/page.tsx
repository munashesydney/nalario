"use client";

import { useState } from "react";
import { Canvas, TextEditorSheet, ShapeEditorSheet } from "@/components/canvas";
import { Toolbar } from "@/components/toolbar";
import { AIChatPanel } from "@/components/chat";
import { Navbar } from "@/components/layout";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { motion, AnimatePresence } from "framer-motion";

const PANEL_WIDTH = 320; // px — matches w-80

export default function Home() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const { activePanel, panelPosition } = useCanvasStore();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-100">
      <Navbar chatPanelOpen={aiPanelOpen} />

      {/* Main layout wrapper */}
      <motion.div
        layout
        className={`flex-1 flex overflow-hidden pt-12 relative ${panelPosition === 'left' ? 'flex-row' : 'flex-row-reverse'}`}
      >

        {/* Dynamic Panel Manager (Renders before or after main based on flex-direction) */}
        <AnimatePresence mode="popLayout">
          {(aiPanelOpen || activePanel) && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="z-40 flex flex-row h-full"
            >
              <TextEditorSheet open={activePanel === "text"} />
              <ShapeEditorSheet open={activePanel === "shape"} />
              <AIChatPanel open={aiPanelOpen && !activePanel} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <motion.main layout className="flex-1 h-full flex relative min-w-0">
          <Canvas />

          {/* Toolbar — centered */}
          <div
            className="absolute bottom-6 z-30"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Toolbar
              onOpenAI={() => setAiPanelOpen(!aiPanelOpen)}
              aiPanelOpen={aiPanelOpen}
            />
          </div>
        </motion.main>
      </motion.div>
    </div>
  );
}
