"use client";

import React from "react";
import Link from "next/link";
import { Plus, Users, Folder, MoreVertical, Star } from "lucide-react";

// Mock Data
const WORKSPACES = [
  { id: "1", name: "Personal Canvas", type: "Personal", projects: 12, members: 1, lastActive: "2 hrs ago", isStarred: true },
  { id: "2", name: "Marketing Team", type: "Team", projects: 45, members: 8, lastActive: "1 day ago", isStarred: false },
  { id: "3", name: "Client Designs", type: "Team", projects: 8, members: 3, lastActive: "3 days ago", isStarred: true },
];

export default function WorkspacesPage() {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Your Workspaces</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and collaborate on your design projects.</p>
        </div>
        <Link 
          href="/workspaces/add"
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-none font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Workspace
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WORKSPACES.map((workspace) => (
          <Link 
            href={`/workspaces/${workspace.id}`} 
            key={workspace.id}
            className="group bg-white rounded-none border-2 border-zinc-200 p-5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] hover:border-zinc-900 transition-all duration-200 relative flex flex-col h-[200px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-bold text-lg group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  {workspace.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-900 transition-colors">{workspace.name}</h2>
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-none border border-zinc-200 inline-block mt-1 group-hover:border-zinc-300">
                    {workspace.type}
                  </span>
                </div>
              </div>
              <button 
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors"
                onClick={(e) => { e.preventDefault(); /* Stop navigation */ }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Folder className="w-4 h-4" /> {workspace.projects}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {workspace.members}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">{workspace.lastActive}</span>
                {workspace.isStarred && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
