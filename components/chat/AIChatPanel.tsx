"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { useCanvasStore } from "../../lib/store/canvas-store";
import { aiJobService } from "../../lib/services/ai-job.service";
import { aiChatService } from "../../lib/services/ai-chat.service";
import { createAiJobAction } from "../../app/actions/ai-jobs";
import { useParams } from "next/navigation";
import { SidePanel } from "../layout/SidePanel";
import { cn } from "../../lib/utils";
import { AIMessage } from "../../lib/types/canvas";
import { streamService } from "../../lib/services/stream.service";
import { createClient } from "../../lib/supabase/client";

interface AIChatPanelProps {
  open: boolean;
}

export function AIChatPanel({ open }: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { 
    messages, addMessage, updateMessage, addElements, panelPosition,
    chats, activeChatId, setChats, setActiveChatId, setMessages,
    canvasWidth, canvasHeight, elements,
    setStreamingElements, clearStreamingElements
  } = useCanvasStore();
  
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  const loadChats = async () => {
    if (!projectId) return;
    try {
      const fetchedChats = await aiChatService.getChats(projectId);
      setChats(fetchedChats);
      if (fetchedChats.length > 0 && !activeChatId) {
        switchChat(fetchedChats[0].id);
      } else if (fetchedChats.length === 0) {
        createNewChat(fetchedChats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createNewChat = async (currentChats = chats) => {
    if (!projectId) return;
    try {
      const newChat = await aiChatService.createChat(projectId, `Chat ${currentChats.length + 1}`);
      setChats([newChat, ...currentChats]);
      switchChat(newChat.id);
    } catch (e) {
      console.error(e);
    }
  };

  const switchChat = async (chatId: string) => {
    setActiveChatId(chatId);
    setMessages([]);
    try {
      const jobs = await aiJobService.getJobsByChat(chatId);
      const mappedMessages: AIMessage[] = [];
      jobs.forEach((job: any) => {
        mappedMessages.push({
          id: `user-${job.id}`,
          role: "user",
          content: job.prompt,
          timestamp: new Date(job.created_at)
        });
        if (job.status === "completed" && job.response_text) {
          mappedMessages.push({
            id: `asst-${job.id}`,
            role: "assistant",
            content: job.response_text,
            timestamp: new Date(job.updated_at)
          });
        } else if (job.status === "failed") {
          mappedMessages.push({
            id: `asst-${job.id}`,
            role: "assistant",
            content: "Sorry, an error occurred: " + (job.error_message || "Unknown error"),
            timestamp: new Date(job.updated_at)
          });
        }
      });
      setMessages(mappedMessages);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (open) {
      loadChats();
      setTimeout(() => textareaRef.current?.focus(), 310);
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [open, projectId]);

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
      // Simplify elements for the AI to reduce token payload
      const simplifiedElements = elements.map(el => ({
        id: el.id,
        type: el.type,
        position: el.position,
        dimensions: el.dimensions,
        content: (el as any).content,
        style: el.style
      }));

      const canvasState = {
        dimensions: { width: canvasWidth, height: canvasHeight },
        elements: simplifiedElements
      };
      
      const jobId = await createAiJobAction(userMessage, projectId, activeChatId || undefined, canvasState);
      
      // Get session token for SSE auth
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
        if (token) {
          // Create an empty assistant message to stream into
          const assistantMsgId = addMessage("assistant", "");
          let currentText = "";
          let currentReasoning = "";

          streamService.connect(jobId, token, {
            onTextDelta: (delta) => {
              currentText += delta;
              updateMessage(assistantMsgId, { content: currentText });
            },
            onReasoningDelta: (delta) => {
              currentReasoning += delta;
              updateMessage(assistantMsgId, { reasoning: currentReasoning });
            },
          onElementDelta: (partialElements) => {
            const streaming = partialElements.map((el, i) => ({ ...el, id: `stream-${i}` }));
            setStreamingElements(streaming);
          },
          onElementAdded: (newElements) => {
            addElements(newElements);
            clearStreamingElements();
          },
          onDone: () => {
            setIsTyping(false);
            clearStreamingElements();
          },
          onError: (msg) => {
            console.error("Stream error:", msg);
            currentText += `\n\n[Error: ${msg}]`;
            updateMessage(assistantMsgId, { content: currentText });
            setIsTyping(false);
          }
        });
      } else {
        // Fallback if no token (shouldn't happen if authenticated)
        console.warn("No auth token, using fallback polling");
        const unsubscribe = aiJobService.subscribeToJob(jobId, (job) => {
          if (job.status === "completed") {
            addMessage("assistant", job.response_text || "");
            setIsTyping(false);
            if (job.response_elements) addElements(job.response_elements);
            unsubscribe();
          } else if (job.status === "failed") {
            addMessage("assistant", "Sorry, an error occurred: " + (job.error_message || "Unknown error"));
            setIsTyping(false);
            unsubscribe();
          }
        });
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
      {/* Chat Selector Header */}
      <div className="shrink-0 px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between gap-3">
        <select 
          className="flex-1 bg-white border-2 border-zinc-900 px-2 py-1.5 text-sm font-bold uppercase cursor-pointer outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none shadow-[2px_2px_0px_rgba(24,24,27,1)] transition-all appearance-none"
          value={activeChatId || ""}
          onChange={(e) => switchChat(e.target.value)}
        >
          {chats.length === 0 && <option value="" disabled>No chats</option>}
          {chats.map(chat => (
            <option key={chat.id} value={chat.id}>{chat.title}</option>
          ))}
        </select>
        <button 
          onClick={() => createNewChat()}
          className="shrink-0 w-8 h-8 flex items-center justify-center bg-zinc-900 text-white border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(24,24,27,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:translate-x-[4px] active:translate-y-[4px]"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 min-w-0 bg-white">
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
                "max-w-[88%] px-3 py-2.5 text-sm leading-relaxed break-words",
                msg.role === "user"
                  ? "bg-zinc-900 text-white shadow-[2px_2px_0px_rgba(0,0,0,0.2)] border-2 border-zinc-900"
                  : "bg-white text-zinc-900 border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(24,24,27,1)]",
              )}
            >
              {msg.reasoning && (
                <details 
                  className="mb-2 group [&_summary::-webkit-details-marker]:hidden"
                  open={isTyping && msg.id === messages[messages.length - 1].id ? true : undefined}
                >
                  <summary className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-400 select-none">
                    <span className="transition-transform group-open:rotate-90">
                      ▶
                    </span>
                    Thinking Process
                  </summary>
                  <div className="mt-2 pl-3 ml-[3px] border-l-2 border-zinc-200 text-zinc-500 italic text-xs whitespace-pre-wrap">
                    {msg.reasoning}
                  </div>
                </details>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(24,24,27,1)] px-3 py-2.5 text-sm text-zinc-900 flex gap-1 items-center">
              <span className="inline-block w-1.5 h-1.5 bg-zinc-900 animate-bounce [animation-delay:0ms]" />
              <span className="inline-block w-1.5 h-1.5 bg-zinc-900 animate-bounce [animation-delay:150ms]" />
              <span className="inline-block w-1.5 h-1.5 bg-zinc-900 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-4 pt-3 shrink-0 min-w-0 bg-white border-t-2 border-zinc-900">
        <div
          className={cn(
            "border-2 border-zinc-900 bg-white transition-all duration-150 shadow-[4px_4px_0px_rgba(24,24,27,1)]",
            "focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_rgba(24,24,27,1)]",
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to design something..."
            rows={1}
            className="block w-full px-3 pt-3 pb-1 text-sm bg-transparent resize-none focus:outline-none text-zinc-900 placeholder:text-zinc-500 font-medium leading-relaxed"
            style={{ minHeight: 40, maxHeight: 128 }}
          />
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <span className="text-[11px] font-bold text-zinc-500 tracking-tight select-none uppercase">
              ⏎ send · ⇧⏎ new
            </span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className={cn(
                "w-6 h-6 flex items-center justify-center transition-colors border-2 border-zinc-900",
                input.trim()
                  ? "bg-[#F4F4F5] text-zinc-900 hover:bg-zinc-200"
                  : "bg-zinc-100 text-zinc-300 cursor-not-allowed border-zinc-200",
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
