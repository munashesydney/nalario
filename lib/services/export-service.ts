import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

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

/**
 * Exports the given HTML element as a PNG image.
 */
export async function exportAsPNG(element: HTMLElement, filename = "canvas.png") {
  try {
    const dataUrl = await htmlToImage.toPng(element, { quality: 1, pixelRatio: 2 });
    downloadURI(dataUrl, filename);
  } catch (err) {
    console.error("Failed to export PNG:", err);
    throw err;
  }
}

/**
 * Exports the given HTML element as an SVG image.
 */
export async function exportAsSVG(element: HTMLElement, filename = "canvas.svg") {
  try {
    const dataUrl = await htmlToImage.toSvg(element, { pixelRatio: 2 });
    downloadURI(dataUrl, filename);
  } catch (err) {
    console.error("Failed to export SVG:", err);
    throw err;
  }
}

/**
 * Exports the given HTML element as a PDF document.
 */
export async function exportAsPDF(element: HTMLElement, filename = "canvas.pdf") {
  try {
    // We convert to PNG first, then embed in a PDF
    const dataUrl = await htmlToImage.toPng(element, { quality: 1, pixelRatio: 2 });
    
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
