import { CanvasElement } from "../types/canvas";

export type StreamCallbacks = {
  onTextDelta?: (delta: string) => void;
  onReasoningDelta?: (delta: string) => void;
  onElementDelta?: (elements: CanvasElement[]) => void;
  onElementAdded?: (elements: CanvasElement[]) => void;
  onCanvasSynced?: (elements: CanvasElement[]) => void;
  onDone?: (jobId: string) => void;
  onError?: (message: string) => void;
};

class StreamService {
  private activeStreams = new Map<string, EventSource>();

  /**
   * Connect to an Express SSE stream for a specific job.
   *
   * @param jobId The job ID to listen to
   * @param token The Supabase session access_token
   * @param callbacks Event handlers
   */
  connect(jobId: string, token: string, callbacks: StreamCallbacks): void {
    // Prevent duplicate connections for the same job
    if (this.activeStreams.has(jobId)) {
      this.disconnect(jobId);
    }

    const expressUrl = process.env.NEXT_PUBLIC_EXPRESS_URL || "http://localhost:4002";
    const url = `${expressUrl}/stream/${jobId}?token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(url);
    this.activeStreams.set(jobId, eventSource);

    eventSource.addEventListener("connected", () => {
      console.log(`[StreamService] Connected to stream for job ${jobId}`);
    });

    eventSource.addEventListener("text-delta", (e: MessageEvent) => {
      if (callbacks.onTextDelta) {
        try {
          const payload = JSON.parse(e.data);
          if (payload.delta) {
            callbacks.onTextDelta(payload.delta);
          }
        } catch (err) {
          console.error("[StreamService] Error parsing text-delta:", err);
        }
      }
    });

    eventSource.addEventListener("element-added", (e: MessageEvent) => {
      if (callbacks.onElementAdded) {
        try {
          const payload = JSON.parse(e.data);
          if (payload.elements) {
            callbacks.onElementAdded(payload.elements);
          }
        } catch (err) {
          console.error("[StreamService] Error parsing element-added:", err);
        }
      }
    });

    eventSource.addEventListener("canvas-synced", (e: MessageEvent) => {
      if (callbacks.onCanvasSynced) {
        try {
          const payload = JSON.parse(e.data);
          if (payload.elements) {
            callbacks.onCanvasSynced(payload.elements);
          }
        } catch (err) {
          console.error("[StreamService] Error parsing canvas-synced:", err);
        }
      }
    });

    eventSource.addEventListener("reasoning-delta", (e: MessageEvent) => {
      if (callbacks.onReasoningDelta) {
        try {
          const payload = JSON.parse(e.data);
          if (payload.delta) {
            callbacks.onReasoningDelta(payload.delta);
          }
        } catch (err) {
          console.error("[StreamService] Error parsing reasoning-delta:", err);
        }
      }
    });

    eventSource.addEventListener("tool-element-delta", (e: MessageEvent) => {
      if (callbacks.onElementDelta) {
        try {
          const payload = JSON.parse(e.data);
          if (payload.elements) {
            console.log(`[StreamService] Received tool-element-delta with ${payload.elements.length} elements`);
            callbacks.onElementDelta(payload.elements);
          }
        } catch (err) {
          console.error("[StreamService] Error parsing tool-element-delta:", err);
        }
      }
    });

    eventSource.addEventListener("done", (e: MessageEvent) => {
      console.log(`[StreamService] Stream finished for job ${jobId}`);
      if (callbacks.onDone) callbacks.onDone(jobId);
      this.disconnect(jobId);
    });

    eventSource.addEventListener("error", (e: MessageEvent) => {
      // EventSource generic error
      console.error(`[StreamService] Connection error for job ${jobId}`);
      if (callbacks.onError) callbacks.onError("Connection lost or server error");
      this.disconnect(jobId);
    });

    // We can also have an explicit application-level error event emitted from our server
    eventSource.addEventListener("app-error", (e: MessageEvent) => {
      if (callbacks.onError) {
        try {
          const payload = JSON.parse(e.data);
          callbacks.onError(payload.message || "Unknown error");
        } catch (err) {
          console.error("[StreamService] Error parsing app-error:", err);
        }
      }
      this.disconnect(jobId);
    });
  }

  /**
   * Close a specific stream.
   */
  disconnect(jobId: string): void {
    const eventSource = this.activeStreams.get(jobId);
    if (eventSource) {
      eventSource.close();
      this.activeStreams.delete(jobId);
    }
  }

  /**
   * Close all active streams (e.g. on unmount).
   */
  disconnectAll(): void {
    this.activeStreams.forEach((es) => es.close());
    this.activeStreams.clear();
  }
}

export const streamService = new StreamService();
