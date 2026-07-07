"use client";

import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { projectService } from "@/lib/services/project.service";
import { Project } from "@/lib/models/project.model";

interface CanvasHydratorProps {
  project: Project;
}

export function CanvasHydrator({ project }: CanvasHydratorProps) {
  const { setElements, elements, setCanvasDimensions } = useCanvasStore();
  const isHydrated = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Hydrate store on mount
  useEffect(() => {
    setCanvasDimensions(project.width || 1920, project.height || 1080);
    if (project.canvas_state && project.canvas_state.elements) {
      setElements(project.canvas_state.elements);
    } else {
      setElements([]); // Initialize empty if no state
    }
    // Small delay to prevent immediate re-save on hydration
    setTimeout(() => {
      isHydrated.current = true;
    }, 500);
  }, [project.id]); // Only re-hydrate if project ID changes

  // 2. Subscribe to changes and debounced save
  useEffect(() => {
    const unsub = useCanvasStore.subscribe((state) => {
      if (!isHydrated.current) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await projectService.updateProjectState(project.id, {
            elements: state.elements,
          });
          console.log("Canvas saved securely to database.");
        } catch (err) {
          console.error("Failed to save canvas state:", err);
        }
      }, 1500); // 1.5 second debounce
    });

    return () => {
      unsub();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [project.id]);

  return null; // This is a logic-only component
}
