"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useModalStore } from "@/lib/store/modal-store";

interface NewProjectButtonProps {
  workspaceId: string;
}

export function NewProjectButton({ workspaceId }: NewProjectButtonProps) {
  const { openModal } = useModalStore();

  const handleCreate = () => {
    openModal('create-project', { workspaceId });
  };

  return (
    <button 
      onClick={handleCreate}
      className="group flex flex-col items-center justify-center h-[240px] rounded-none border-2 border-dashed border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all cursor-pointer"
    >
      <div className="w-12 h-12 rounded-none bg-zinc-100 group-hover:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors mb-3">
        <Plus className="w-6 h-6" />
      </div>
      <span className="font-semibold text-zinc-600 group-hover:text-zinc-900 transition-colors">
        New Project
      </span>
    </button>
  );
}
