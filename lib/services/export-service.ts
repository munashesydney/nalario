import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { CanvasElement } from "../types/canvas";

/**
 * Downloads a data URI as a file.
 */
function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface ExportOptions {
  filename?: string;
  transparent?: boolean;
  backgroundColor?: string;
}

/**
 * Exports the given HTML element as a PNG image.
 */
export async function exportAsPNG(element: HTMLElement, options: ExportOptions = {}) {
  const { filename = "canvas.png", transparent = false, backgroundColor = "#ffffff" } = options;
  try {
    const dataUrl = await htmlToImage.toPng(element, { 
      quality: 1, 
      pixelRatio: 2,
      style: transparent ? { backgroundColor: "transparent" } : { backgroundColor },
    });
    downloadURI(dataUrl, filename);
  } catch (err) {
    console.error("Failed to export PNG:", err);
    throw err;
  }
}

/**
 * Exports the given HTML element as an SVG image.
 */
export async function exportAsSVG(element: HTMLElement, options: ExportOptions = {}) {
  const { filename = "canvas.svg", transparent = false, backgroundColor = "#ffffff" } = options;
  try {
    const dataUrl = await htmlToImage.toSvg(element, { 
      pixelRatio: 2,
      style: transparent ? { backgroundColor: "transparent" } : { backgroundColor },
    });
    downloadURI(dataUrl, filename);
  } catch (err) {
    console.error("Failed to export SVG:", err);
    throw err;
  }
}

/**
 * Exports the given HTML element as a PDF document.
 */
export async function exportAsPDF(element: HTMLElement, options: ExportOptions = {}) {
  const { filename = "canvas.pdf", transparent = false, backgroundColor = "#ffffff" } = options;
  try {
    // We convert to PNG first, then embed in a PDF
    const dataUrl = await htmlToImage.toPng(element, { 
      quality: 1, 
      pixelRatio: 2,
      style: transparent ? { backgroundColor: "transparent" } : { backgroundColor },
    });
    
    // Get original dimensions to scale the PDF properly
    const rect = element.getBoundingClientRect();
    const pdf = new jsPDF({
      orientation: rect.width > rect.height ? "landscape" : "portrait",
      unit: "px",
      format: [rect.width, rect.height]
    });
    
    pdf.addImage(dataUrl, "PNG", 0, 0, rect.width, rect.height);
    pdf.save(filename);
  } catch (err) {
    console.error("Failed to export PDF:", err);
    throw err;
  }
}

/**
 * Exports the canvas elements as a JSON file.
 */
export function exportAsJSON(elements: CanvasElement[], filename = "canvas.json") {
  try {
    const jsonStr = JSON.stringify(elements, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    downloadURI(url, filename);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to export JSON:", err);
    throw err;
  }
}

/**
 * Imports a JSON file and parses it into CanvasElements.
 */
export async function importFromJSON(file: File): Promise<CanvasElement[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (!result) throw new Error("File is empty");
        const elements = JSON.parse(result) as CanvasElement[];
        // Basic validation: ensure it's an array
        if (!Array.isArray(elements)) {
          throw new Error("Invalid format: expected an array of elements");
        }
        resolve(elements);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
