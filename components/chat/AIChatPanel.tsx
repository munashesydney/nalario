"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useCanvasStore } from "../../lib/store/canvas-store";
import { aiJobService } from "../../lib/services/ai-job.service";
import { createAiJobAction } from "../../app/actions/ai-jobs";
import { useParams } from "next/navigation";
import { SidePanel } from "../layout/SidePanel";
import { cn } from "../../lib/utils";

interface AIChatPanelProps {
  open: boolean;
}

export function AIChatPanel({ open }: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, addMessage, addElements, panelPosition } = useCanvasStore();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 310);
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, open]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    addMessage("user", userMessage);
    setIsTyping(true);

    try {
      const jobId = await createAiJobAction(userMessage, projectId);
      
      const unsubscribe = aiJobService.subscribeToJob(jobId, (job) => {
        if (job.status === "completed") {
          addMessage("assistant", job.response_text || "");
          setIsTyping(false);
          
          if (job.response_elements) {
            addElements(job.response_elements);
          }
          unsubscribe();
        } else if (job.status === "failed") {
          addMessage("assistant", "Sorry, an error occurred: " + (job.error_message || "Unknown error"));
          setIsTyping(false);
          unsubscribe();
        }
      });
      
      // The AI might finish so fast that the websocket misses the 'completed' update.
      // We manually check the state right after subscribing to catch this race condition.
      const initialJob = await aiJobService.getJob(jobId);
      if (initialJob && initialJob.status === "completed") {
        addMessage("assistant", initialJob.response_text || "");
        setIsTyping(false);
        if (initialJob.response_elements) {
          addElements(initialJob.response_elements);
        }
        unsubscribe();
      } else if (initialJob && initialJob.status === "failed") {
        addMessage("assistant", "Sorry, an error occurred: " + (initialJob.error_message || "Unknown error"));
        setIsTyping(false);
        unsubscribe();
      }
    } catch (error: any) {
      console.error(error);
      addMessage("assistant", "Failed to submit job: " + (error.message || "Unknown error"));
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
  };

  return (
    <SidePanel 
      open={open} 
      title="Assistant"
      variant="floating"
      position={panelPosition}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 min-w-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[88%] px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
                msg.role === "user"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-50 text-zinc-700 border border-zinc-200",
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm text-zinc-400 flex gap-1 items-center">
              <span className="inline-block w-1 h-1 bg-zinc-400 animate-bounce [animation-delay:0ms]" />
              <span className="inline-block w-1 h-1 bg-zinc-400 animate-bounce [animation-delay:150ms]" />
              <span className="inline-block w-1 h-1 bg-zinc-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-4 pt-2 shrink-0 min-w-0">
        <div
          className={cn(
            "border border-zinc-200 bg-white transition-colors duration-150",
            "focus-within:border-zinc-400",
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to design something..."
            rows={1}
            className="block w-full px-3 pt-3 pb-1 text-sm bg-transparent resize-none focus:outline-none text-zinc-900 placeholder:text-zinc-400 leading-relaxed"
            style={{ minHeight: 40, maxHeight: 128 }}
          />
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <span className="text-[11px] text-zinc-400 tracking-tight select-none">
              ⏎ send · ⇧⏎ newline
            </span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className={cn(
                "w-6 h-6 flex items-center justify-center transition-colors",
                input.trim()
                  ? "bg-zinc-900 text-white hover:bg-zinc-700"
                  : "bg-zinc-100 text-zinc-300 cursor-not-allowed",
              )}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
