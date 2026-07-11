"use client";

import { useCanvasStore } from "../../lib/store/canvas-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UploadResult {
  url: string;
  objectKey: string;
}

// ---------------------------------------------------------------------------
// Upload helper
// ---------------------------------------------------------------------------

/**
 * Upload an image file to Cloudflare R2 via the internal API route,
 * and return the accessible URL + object key.
 */
export async function uploadToR2(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/cloudfare/r2", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Upload failed with status ${res.status}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Opens the native file picker, uploads the selected image to Cloudflare R2,
 * and places it on the canvas at the default position.
 */
export async function openImagePicker(): Promise<void> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    try {
      // 1. Upload to R2
      const { url, objectKey } = await uploadToR2(file);

      // 2. Measure natural dimensions to preserve aspect ratio
      const img = new Image();
      img.onload = () => {
        const dims = getScaledDimensions(img.naturalWidth, img.naturalHeight);
        placeImage(url, objectKey, dims);
      };
      img.src = url;
    } catch (err) {
      console.error("Failed to upload and place image:", err);
      // TODO: surface error to user via toast
    }
  };

  input.click();
}

// ---------------------------------------------------------------------------
// Cleanup helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Place image on canvas
// ---------------------------------------------------------------------------

/**
 * Place an uploaded image on the canvas at the default position.
 */
export function placeImage(
  url: string,
  objectKey: string | undefined,
  dimensions?: { width: number; height: number },
): void {
  useCanvasStore
    .getState()
    .addImage(url, { x: 150, y: 100 }, dimensions, objectKey);
}

/**
 * Place an uploaded image at a specific canvas-space coordinate.
 */
export function placeImageAt(
  url: string,
  objectKey: string | undefined,
  canvasX: number,
  canvasY: number,
  dimensions?: { width: number; height: number },
): void {
  // Center the image on the drop point
  const w = dimensions?.width ?? 250;
  const h = dimensions?.height ?? Math.round(w);
  const pos = { x: canvasX - w / 2, y: canvasY - h / 2 };

  useCanvasStore.getState().addImage(url, pos, { width: w, height: h }, objectKey);
}

/**
 * Measure an image's natural dimensions, scaled to fit within maxDim.
 */
export function getScaledDimensions(
  naturalWidth: number,
  naturalHeight: number,
  maxDim = 250,
): { width: number; height: number } {
  let w = naturalWidth;
  let h = naturalHeight;

  if (w > maxDim || h > maxDim) {
    const ratio = maxDim / Math.max(w, h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  return { width: w, height: h };
}

/**
 * Extract objectKey from a canvas element's style and delete the
 * corresponding R2 object.  Safe to call even if the element has no
 * objectKey (no-op).
 *
 * Call this when an image element is permanently removed from the canvas
 * so orphaned R2 objects don't accumulate.
 *
 * @example
 *   import { openImagePicker, deleteUploadedImage } from "@/lib/services/image-service";
 *   useCanvasStore.subscribe((state, prev) => {
 *     // detect deletions...
 *   });
 */
export async function deleteUploadedImage(objectKey: string | undefined): Promise<void> {
  if (!objectKey) return;

  try {
    const res = await fetch(`/api/cloudfare/r2?key=${encodeURIComponent(objectKey)}`, {
      method: "DELETE",
    });

    if (!res.ok && res.status !== 404) {
      console.error("Failed to delete R2 image:", await res.text());
    }
  } catch (err) {
    console.error("Failed to delete R2 image:", err);
  }
}

/**
 * Delete all images from R2 that were orphaned by a canvas state reset.
 * Compares the current elements against the previous elements.
 */
export function createImageCleanupHandler(getElements: () => { id: string; style?: { objectKey?: string } }[]) {
  let prevKeys = new Set<string>();

  return () => {
    const current = getElements();
    const currentKeys = new Set(
      current
        .filter((el) => el.style?.objectKey)
        .map((el) => el.style!.objectKey!),
    );

    // Keys that disappeared from the current set
    prevKeys.forEach((key) => {
      if (!currentKeys.has(key)) {
        deleteUploadedImage(key);
      }
    });

    prevKeys = currentKeys;
  };
}
